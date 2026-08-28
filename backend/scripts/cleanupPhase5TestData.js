#!/usr/bin/env node
/**
 * One-time removal of leftover Phase 5 test fixtures (Solutions/Catalogue
 * Completeness Audit §27) — a test category tree (apparel-p5test >
 * polos-p5test) and two test products (premium-corporate-polo-p5,
 * -p5-copy) that were left inactive in the DB rather than cleaned up.
 *
 * Verified safe before writing this script (not by name alone):
 *   - Both products/categories are INACTIVE, never publicly visible.
 *   - Neither product has any Tag, SolutionProduct, or ProductRelated rows.
 *   - Neither category has any active/other children beyond this pair.
 *   - One historical RFQItem references premium-corporate-polo-p5's id —
 *     RFQItem.productId is deliberately NOT a real foreign key (see
 *     schema.prisma's RFQItem comment): the row snapshots productName/
 *     productSlug/spec at submission time specifically so it survives the
 *     catalogue product being deleted later. Left untouched here — this
 *     script only ever deletes Category/Product rows.
 *
 * Usage:
 *   node scripts/cleanupPhase5TestData.js --dry-run
 *   node scripts/cleanupPhase5TestData.js
 */
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const prisma = require("../src/lib/prisma");
const { assertBackfillAllowed } = require("../src/utils/backfillGuard");

const DRY_RUN = process.argv.includes("--dry-run");
const PRODUCT_SLUGS = ["premium-corporate-polo-p5", "premium-corporate-polo-p5-copy"];
const CATEGORY_SLUGS = ["polos-p5test", "apparel-p5test"]; // child before parent

function assertSafeToRun() {
  try {
    assertBackfillAllowed(process.env, { flagName: "ALLOW_PHASE5_CLEANUP", dryRun: DRY_RUN, label: "cleanup-phase5" });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

async function main() {
  assertSafeToRun();
  console.log(`[cleanup-phase5] target database: ${new URL(process.env.DATABASE_URL).hostname}:${new URL(process.env.DATABASE_URL).port}${new URL(process.env.DATABASE_URL).pathname}${DRY_RUN ? "  (DRY RUN)" : ""}`);

  const products = await prisma.product.findMany({ where: { slug: { in: PRODUCT_SLUGS } } });
  const categories = await prisma.category.findMany({ where: { slug: { in: CATEGORY_SLUGS } } });

  for (const p of products) {
    if (p.active) throw new Error(`Refusing to delete ACTIVE product "${p.slug}" — safety check failed.`);
  }
  for (const c of categories) {
    if (c.active) throw new Error(`Refusing to delete ACTIVE category "${c.slug}" — safety check failed.`);
  }

  console.log(`[cleanup-phase5] Products to remove: ${products.map((p) => p.slug).join(", ") || "(none found)"}`);
  console.log(`[cleanup-phase5] Categories to remove: ${categories.map((c) => c.slug).join(", ") || "(none found)"}`);

  if (DRY_RUN) return;

  await prisma.$transaction(async (tx) => {
    for (const p of products) {
      await tx.product.delete({ where: { id: p.id } });
    }
    for (const slug of CATEGORY_SLUGS) {
      const c = categories.find((cat) => cat.slug === slug);
      if (c) await tx.category.delete({ where: { id: c.id } });
    }
  });

  console.log("[cleanup-phase5] Done.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[cleanup-phase5] Fatal error:", err);
  process.exitCode = 1;
});
