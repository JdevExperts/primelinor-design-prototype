#!/usr/bin/env node
/**
 * One-time backfill: the canonical 10 solutions, sourced from
 * scripts/lib/solutionsSeedData.js (the historical content of what used to
 * be frontend/src/data/solutionsData.js, before Solutions became backend-
 * managed data — see that file's own header comment) → Solution +
 * SolutionProduct rows in the database (Solutions Phase A §9/§10/§11).
 * Idempotent — upserts by Solution.slug and by the [solutionId, productId]
 * unique pair, so a rerun never creates duplicates.
 *
 * Usage:
 *   node scripts/backfillSolutions.js --dry-run    # plan only, no writes
 *   node scripts/backfillSolutions.js               # actually write
 *
 * Safety (mirrors backfillLegacyCatalog.js §7): refuses outright in
 * production, and requires an explicit opt-in env var even in dev.
 *
 * Failure mode discipline (Solutions Phase A §10): the OLD frontend
 * behavior (SolutionProducts.jsx) silently dropped any recommendedProductIds
 * slug that didn't resolve. This script does the opposite — if a slug
 * doesn't resolve to a real Product, that Solution's backfill is ABORTED
 * and reported, never silently short of its 5 mappings.
 */
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const prisma = require("../src/lib/prisma");
const { assertBackfillAllowed } = require("../src/utils/backfillGuard");
const { solutions, homeSolutionSlugs } = require("./lib/solutionsSeedData");

const DRY_RUN = process.argv.includes("--dry-run");

function assertSafeToRun() {
  try {
    assertBackfillAllowed(process.env, { flagName: "ALLOW_SOLUTIONS_BACKFILL", dryRun: DRY_RUN, label: "backfill-solutions" });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

function printTargetDatabase() {
  const raw = process.env.DATABASE_URL || "";
  let display = "(DATABASE_URL not set)";
  try {
    const u = new URL(raw);
    display = `${u.hostname}:${u.port || "5432"}${u.pathname}`;
  } catch {
    // leave the fallback message
  }
  console.log(`[backfill-solutions] NODE_ENV=${process.env.NODE_ENV || "(unset)"}  target database: ${display}${DRY_RUN ? "  (DRY RUN — no writes)" : ""}`);
}

function solutionFields(entry) {
  return {
    name: entry.label,
    eyebrow: entry.eyebrow ?? null,
    hubDescription: entry.hubDescription,
    heroTitle: entry.heroTitle,
    heroCopy: entry.heroCopy,
    challengeTitle: entry.challengeTitle ?? null,
    challengeCopy: entry.challengeCopy ?? null,
    challengePoints: entry.challengePoints ?? null,
    useCases: entry.useCases ?? null,
    benefits: entry.benefits ?? null,
    processSteps: entry.processSteps ?? null,
    featureSections: entry.featureSections ?? null,
    finalCta: entry.finalCta ?? null,
    primaryCtaLabel: entry.primaryCtaLabel ?? null,
    secondaryCtaLabel: entry.secondaryCtaLabel ?? null,
    secondaryCtaTo: entry.secondaryCtaTo ?? null,
    proofTestimonialId: entry.proofTestimonialId ?? null,
    art: entry.art ?? null,
    color: entry.color ?? null,
  };
}

async function main() {
  assertSafeToRun();
  printTargetDatabase();

  const report = { solutionsUpserted: [], mappingsUpserted: 0, aborted: [] };

  for (let index = 0; index < solutions.length; index += 1) {
    const entry = solutions[index];
    const sortOrder = index;
    const homeIndex = homeSolutionSlugs.indexOf(entry.slug);
    const featuredOnHome = homeIndex !== -1;
    // homeSolutionSlugs has its OWN deliberate order, genuinely different
    // from the hub array's order for at least one slug ("startups" is 2nd
    // in `solutions` but 5th in homeSolutionSlugs) — homeSortOrder must
    // come from THIS array's index, never reuse the hub `sortOrder`.
    const homeSortOrder = featuredOnHome ? homeIndex : 0;

    // Resolve every recommendedProductIds slug BEFORE writing anything for
    // this solution — a partial mapping is worse than no mapping (§10).
    const resolved = [];
    let failed = false;
    for (const productSlug of entry.recommendedProductIds || []) {
      const product = DRY_RUN
        ? { id: `dry-run:${productSlug}`, slug: productSlug, active: true }
        : await prisma.product.findUnique({ where: { slug: productSlug } });
      if (!product) {
        report.aborted.push({ slug: entry.slug, reason: `recommendedProductIds slug "${productSlug}" does not resolve to a real Product.` });
        failed = true;
        break;
      }
      resolved.push(product);
    }
    if (failed) {
      console.error(`[backfill-solutions] ABORTED "${entry.slug}" — see report.aborted.`);
      continue;
    }

    const fields = {
      ...solutionFields(entry),
      active: true, // all 10 launch solutions independently verified to resolve >=1 active product (audit §7/§17)
      featuredOnHome,
      sortOrder,
      homeSortOrder,
    };

    if (DRY_RUN) {
      console.log(`[dry-run] solution: ${entry.slug} (sortOrder=${sortOrder}, featuredOnHome=${featuredOnHome}, homeSortOrder=${homeSortOrder}, products=${resolved.map((p) => p.slug).join(", ")})`);
      report.solutionsUpserted.push(entry.slug);
      report.mappingsUpserted += resolved.length;
      continue;
    }

    const solution = await prisma.solution.upsert({
      where: { slug: entry.slug },
      update: fields,
      create: { slug: entry.slug, ...fields },
    });
    report.solutionsUpserted.push(entry.slug);

    for (let productIndex = 0; productIndex < resolved.length; productIndex += 1) {
      const product = resolved[productIndex];
      await prisma.solutionProduct.upsert({
        where: { solutionId_productId: { solutionId: solution.id, productId: product.id } },
        update: { sortOrder: productIndex },
        create: { solutionId: solution.id, productId: product.id, sortOrder: productIndex, featured: false },
      });
      report.mappingsUpserted += 1;
    }
  }

  console.log(`[backfill-solutions] Solutions upserted: ${report.solutionsUpserted.length}/${solutions.length}`);
  console.log(`[backfill-solutions] SolutionProduct mappings upserted: ${report.mappingsUpserted}`);
  if (report.aborted.length) {
    console.error(`[backfill-solutions] ABORTED solutions: ${report.aborted.length}`);
    report.aborted.forEach((a) => console.error(`  - ${a.slug}: ${a.reason}`));
    process.exitCode = 1;
  }

  if (!DRY_RUN) await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[backfill-solutions] Fatal error:", err);
  process.exitCode = 1;
});
