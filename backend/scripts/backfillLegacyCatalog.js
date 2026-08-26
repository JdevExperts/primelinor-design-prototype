#!/usr/bin/env node
/**
 * Local catalogue backfill (Phase 6A). Reads the legacy PrimeLinor/Teekart
 * SQL export (source data only — never restored directly, never connected
 * to live, see README section in the phase completion report), transforms
 * a curated subset into the NEW Prisma schema, and upserts it into the
 * CURRENT LOCAL dev database only. Also bootstraps new marketplace
 * products the legacy DB has no equivalent for.
 *
 * Usage:
 *   node scripts/backfillLegacyCatalog.js --dry-run    # plan only, no writes
 *   node scripts/backfillLegacyCatalog.js               # actually import
 *
 * Safety (Phase 6A §7): refuses outright in production, and requires an
 * explicit opt-in env var even in dev — this is a rare, high-blast-radius
 * one-time operation, not routine dev tooling like prisma/seed.js.
 */
const path = require("node:path");
const fs = require("node:fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const prisma = require("../src/lib/prisma");
const { loadLegacyDump } = require("./lib/legacySqlParser");
const { SKIP_REASONS, IMPORT_PLAN, LEGACY_CATEGORY_TAGS } = require("./lib/legacyProductPlan");
const { flattenCategoryTree } = require("./lib/newCategoryTree");
const { REQUIRED_COLORS } = require("./lib/colorPlan");
const { NEW_PRODUCTS } = require("./lib/newProductPlan");
const {
  slugify,
  resolveUniqueSlug,
  cleanDescription,
  materialFromFabricName,
  pricingSlabsToTiers,
  sizesToVariants,
  resolveLegacyImageUrl,
} = require("./lib/catalogTransform");

const DRY_RUN = process.argv.includes("--dry-run");
const LEGACY_DUMP_PATH = path.join(__dirname, "../../primelinorbulk_backup.sql");

// ── Safety guards (§7) ───────────────────────────────────────────────────────

function assertSafeToRun() {
  if (process.env.NODE_ENV === "production") {
    console.error("[backfill] Refusing to run: NODE_ENV=production. This script never runs against production.");
    process.exit(1);
  }
  if (process.env.ALLOW_LEGACY_CATALOG_BACKFILL !== "true" && !DRY_RUN) {
    console.error(
      "[backfill] Refusing to run without explicit opt-in. Set ALLOW_LEGACY_CATALOG_BACKFILL=true to actually " +
        "write to the local DB, or pass --dry-run to preview the plan without writing anything.",
    );
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
  console.log(`[backfill] Target database: ${display}${DRY_RUN ? "  (DRY RUN — no writes)" : ""}`);
}

// ── Report accumulator ───────────────────────────────────────────────────────

const report = {
  legacyCategoriesFound: [],
  legacyProductsFound: 0,
  imported: [],
  generated: [],
  skipped: [],
  missingImage: [],
  missingPricing: [],
  inactiveProducts: [],
  customizationIncomplete: [],
  prototypeDerivedPricing: [],
  legacyImageReferencesReused: 0,
  legacyImageReferencesSkipped: [],
  warnings: [],
  phase5TestHandling: [],
};

// ── Category bootstrap (§9/§10) ──────────────────────────────────────────────

async function upsertCategoryTree() {
  const flat = flattenCategoryTree();
  const idByKey = {};

  // Parents first, then children (children need the parent's real id).
  for (const cat of flat.filter((c) => !c.parentKey)) {
    if (DRY_RUN) {
      console.log(`[dry-run] category (parent): ${cat.name} (${cat.slug})`);
      idByKey[cat.key] = `dry-run:${cat.key}`;
      continue;
    }
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder, active: true },
      create: { slug: cat.slug, name: cat.name, sortOrder: cat.sortOrder, active: true },
    });
    idByKey[cat.key] = row.id;
  }
  for (const cat of flat.filter((c) => c.parentKey)) {
    if (DRY_RUN) {
      console.log(`[dry-run] category (child of ${cat.parentKey}): ${cat.name} (${cat.slug})`);
      idByKey[cat.key] = `dry-run:${cat.key}`;
      continue;
    }
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder, active: true, parentCategoryId: idByKey[cat.parentKey] },
      create: { slug: cat.slug, name: cat.name, sortOrder: cat.sortOrder, active: true, parentCategoryId: idByKey[cat.parentKey] },
    });
    idByKey[cat.key] = row.id;
  }
  console.log(`[backfill] Categories upserted: ${flat.length} (${flat.filter((c) => !c.parentKey).length} parent + ${flat.filter((c) => c.parentKey).length} child)`);
  return idByKey;
}

// ── Colors (§20) ──────────────────────────────────────────────────────────

async function upsertColors() {
  const idBySlug = {};
  for (const c of REQUIRED_COLORS) {
    if (DRY_RUN) {
      console.log(`[dry-run] color: ${c.name} (${c.slug})`);
      idBySlug[c.slug] = `dry-run:${c.slug}`;
      continue;
    }
    const row = await prisma.color.upsert({
      where: { slug: c.slug },
      update: { name: c.name, hex: c.hex, active: true },
      create: { slug: c.slug, name: c.name, hex: c.hex, active: true },
    });
    idBySlug[c.slug] = row.id;
  }
  console.log(`[backfill] Colors upserted: ${REQUIRED_COLORS.length}`);
  return idBySlug;
}

// ── Tags (§33) — confirm the required vocabulary exists; don't invent more ──

async function ensureTags() {
  const REQUIRED_TAGS = [
    { slug: "corporate-teams", name: "Corporate Teams" },
    { slug: "startups", name: "Startups" },
    { slug: "events", name: "Events" },
    { slug: "schools-colleges", name: "Schools & Colleges" },
    { slug: "marketing-campaigns", name: "Marketing Campaigns" },
    { slug: "employee-gifting", name: "Employee Gifting" },
    { slug: "promotional", name: "Promotional" },
  ];
  const idBySlug = {};
  for (const t of REQUIRED_TAGS) {
    if (DRY_RUN) {
      idBySlug[t.slug] = `dry-run:${t.slug}`;
      continue;
    }
    const row = await prisma.tag.upsert({ where: { slug: t.slug }, update: {}, create: t });
    idBySlug[t.slug] = row.id;
  }
  return idBySlug;
}

// ── Legacy product import (§11-25) ───────────────────────────────────────────

// Note: legacy data has no color information at all (no such table in the
// dump) — imported products get no color assignments, matching §20's
// "only assign colors to products where reasonable" (there's no evidence
// to assign from here).
async function importLegacyProducts(legacy, categoryIdByKey, tagIdBySlug, existingSlugs) {
  const categoriesById = Object.fromEntries(legacy.categories.map((c) => [c.id, c]));
  const fabricsById = Object.fromEntries(legacy.fabricTypes.map((f) => [f.id, f]));
  const slabsByProductId = {};
  for (const s of legacy.pricingSlabs) {
    (slabsByProductId[s.product_id] ||= []).push(s);
  }
  const imagesByProductId = {};
  for (const img of legacy.productImages) {
    (imagesByProductId[img.product_id] ||= []).push(img);
  }

  const importedIds = {}; // legacy name -> new product id/slug, for related-products pass

  for (const legacyProduct of legacy.products) {
    const name = legacyProduct.name;
    const plan = IMPORT_PLAN[name];

    if (!plan) {
      const reason = SKIP_REASONS[name] || "not in the curated import plan (unreviewed legacy row)";
      report.skipped.push({ name, reason });
      if (!SKIP_REASONS[name]) report.warnings.push(`Legacy product "${name}" has no explicit plan entry — treated as skipped.`);
      continue;
    }

    const slug = resolveUniqueSlug(slugify(plan.name), existingSlugs);
    existingSlugs.add(slug);

    const fabric = fabricsById[legacyProduct.fabric_id];
    const slabs = slabsByProductId[legacyProduct.id] || [];
    const images = (imagesByProductId[legacyProduct.id] || []).sort((a, b) => Number(a.sort_order) - Number(b.sort_order));

    const { tiers, moq } = pricingSlabsToTiers(slabs);
    if (!tiers.length) {
      report.missingPricing.push(name);
      report.warnings.push(`"${name}" has no legacy pricing_slabs rows — skipping (cannot set a real MOQ/price without them).`);
      continue;
    }

    const resolvedImages = [];
    for (const img of images) {
      const resolved = resolveLegacyImageUrl(img.image_url);
      if (resolved.ok) {
        resolvedImages.push({ url: resolved.url, alt: img.alt_text || null, sortOrder: Number(img.sort_order) });
      } else {
        report.legacyImageReferencesSkipped.push({ product: name, url: img.image_url, reason: resolved.reason });
      }
    }
    if (!resolvedImages.length) report.missingImage.push(plan.name);

    const specifications = [
      fabric ? { label: "Fabric", value: materialFromFabricName(fabric.name), sortOrder: 0 } : null,
      legacyProduct.gsm ? { label: "GSM", value: `${legacyProduct.gsm} GSM`, sortOrder: 1 } : null,
    ].filter(Boolean);

    const variants = sizesToVariants(legacyProduct.available_sizes);
    const legacyCategoryName = categoriesById[legacyProduct.category_id]?.name;
    const tagSlugs = LEGACY_CATEGORY_TAGS[legacyCategoryName] || [];

    if (DRY_RUN) {
      console.log(
        `[dry-run] product: "${plan.name}" (${slug}) — category=${plan.category}, moq=${moq}, tiers=${tiers.length}, ` +
          `variants=${variants.length}, images=${resolvedImages.length}/${images.length}, specs=${specifications.length}`,
      );
      report.imported.push({ legacyName: name, name: plan.name, slug, category: plan.category, moq, tierCount: tiers.length, imageCount: resolvedImages.length });
      importedIds[name] = { id: `dry-run:${slug}`, slug };
      continue;
    }

    try {
      const productId = await prisma.$transaction(async (tx) => {
        const created = await tx.product.upsert({
          where: { slug },
          update: {
            name: plan.name,
            categoryId: categoryIdByKey[plan.category],
            description: cleanDescription(legacyProduct.description),
            material: fabric ? materialFromFabricName(fabric.name) : null,
            gsm: legacyProduct.gsm ? Number(legacyProduct.gsm) : null,
            moq,
            unit: "piece",
            priceMode: "TIERED",
            customizable: false,
            variantType: variants.length ? "size" : null,
            dispatchEstimate: "7–10 working days",
            active: true,
            sortOrder: plan.sortOrder ?? 0,
          },
          create: {
            slug,
            name: plan.name,
            categoryId: categoryIdByKey[plan.category],
            description: cleanDescription(legacyProduct.description),
            material: fabric ? materialFromFabricName(fabric.name) : null,
            gsm: legacyProduct.gsm ? Number(legacyProduct.gsm) : null,
            moq,
            unit: "piece",
            priceMode: "TIERED",
            customizable: false,
            variantType: variants.length ? "size" : null,
            dispatchEstimate: "7–10 working days",
            active: true,
            sortOrder: plan.sortOrder ?? 0,
          },
        });

        await tx.productPriceTier.deleteMany({ where: { productId: created.id } });
        await tx.productPriceTier.createMany({ data: tiers.map((t) => ({ ...t, productId: created.id })) });

        await tx.productVariant.deleteMany({ where: { productId: created.id } });
        if (variants.length) {
          await tx.productVariant.createMany({ data: variants.map((v) => ({ ...v, productId: created.id, active: true })) });
        }

        await tx.productSpecification.deleteMany({ where: { productId: created.id } });
        if (specifications.length) {
          await tx.productSpecification.createMany({ data: specifications.map((s) => ({ ...s, productId: created.id })) });
        }

        await tx.productAsset.deleteMany({ where: { productId: created.id, storageKey: null } });
        if (resolvedImages.length) {
          await tx.productAsset.createMany({
            data: resolvedImages.map((img, i) => ({
              productId: created.id,
              type: i === 0 ? "CATALOG" : "GALLERY_FRONT",
              storageKey: null,
              url: img.url,
              alt: img.alt,
              sortOrder: img.sortOrder,
              active: true,
              supportsArtworkOverlay: false,
            })),
          });
        }

        await tx.productTag.deleteMany({ where: { productId: created.id } });
        const tagIds = tagSlugs.map((s) => tagIdBySlug[s]).filter(Boolean);
        if (tagIds.length) {
          await tx.productTag.createMany({ data: tagIds.map((tagId) => ({ productId: created.id, tagId })) });
        }

        return created.id;
      });

      report.legacyImageReferencesReused += resolvedImages.length;
      report.imported.push({ legacyName: name, name: plan.name, slug, category: plan.category, moq, tierCount: tiers.length, imageCount: resolvedImages.length });
      importedIds[name] = { id: productId, slug };
      console.log(`[backfill] imported: ${plan.name} (${slug})`);
    } catch (err) {
      report.warnings.push(`Failed to import "${name}": ${err.message}`);
      console.error(`[backfill] FAILED: ${name} — ${err.message}`);
    }
  }

  return importedIds;
}

// ── New bootstrap products (§27-30) ─────────────────────────────────────────

async function createNewProducts(categoryIdByKey, tagIdBySlug, existingSlugs) {
  const createdIds = {};
  for (const p of NEW_PRODUCTS) {
    const slug = resolveUniqueSlug(p.slug, existingSlugs);
    existingSlugs.add(slug);

    if (DRY_RUN) {
      console.log(`[dry-run] new product: "${p.name}" (${slug}) — category=${p.category}, priceMode=QUOTE_ONLY`);
      report.generated.push({ name: p.name, slug, category: p.category });
      createdIds[p.slug] = { id: `dry-run:${slug}`, slug };
      continue;
    }

    try {
      const productId = await prisma.$transaction(async (tx) => {
        const created = await tx.product.upsert({
          where: { slug },
          update: {
            name: p.name,
            categoryId: categoryIdByKey[p.category],
            description: p.description,
            material: p.material,
            gsm: p.gsm,
            moq: p.moq,
            unit: p.unit,
            priceMode: "QUOTE_ONLY",
            customizable: false,
            variantType: p.variantType || null,
            dispatchEstimate: p.dispatchEstimate,
            active: true,
          },
          create: {
            slug,
            name: p.name,
            categoryId: categoryIdByKey[p.category],
            description: p.description,
            material: p.material,
            gsm: p.gsm,
            moq: p.moq,
            unit: p.unit,
            priceMode: "QUOTE_ONLY",
            customizable: false,
            variantType: p.variantType || null,
            dispatchEstimate: p.dispatchEstimate,
            active: true,
          },
        });

        await tx.productSpecification.deleteMany({ where: { productId: created.id } });
        if (p.specifications?.length) {
          await tx.productSpecification.createMany({
            data: p.specifications.map((s, i) => ({ ...s, sortOrder: i, productId: created.id })),
          });
        }

        await tx.productTag.deleteMany({ where: { productId: created.id } });
        const tagIds = (p.tags || []).map((s) => tagIdBySlug[s]).filter(Boolean);
        if (tagIds.length) {
          await tx.productTag.createMany({ data: tagIds.map((tagId) => ({ productId: created.id, tagId })) });
        }

        return created.id;
      });

      report.generated.push({ name: p.name, slug, category: p.category });
      report.missingImage.push(p.name);
      createdIds[p.slug] = { id: productId, slug };
      console.log(`[backfill] generated: ${p.name} (${slug})`);
    } catch (err) {
      report.warnings.push(`Failed to create new product "${p.name}": ${err.message}`);
      console.error(`[backfill] FAILED: ${p.name} — ${err.message}`);
    }
  }
  return createdIds;
}

// ── Related products (§34) — a modest, curated set, not a full graph ────────

async function linkRelatedProducts(legacyIds, newIds) {
  const bySlug = (slugOrLegacyName, source) => source[slugOrLegacyName]?.id;
  const links = [
    // Cotton T-shirt family cross-sells into Polo/Hoodie
    [bySlug("Biowash Round Neck", legacyIds), bySlug("premium-polo", newIds) || bySlug("pullover-hoodie", newIds)],
    [bySlug("Round Neck Cotton", legacyIds), bySlug("pullover-hoodie", newIds)],
    // Drinkware <-> Stationery, a common welcome-kit pairing
    [bySlug("vacuum-insulated-bottle", newIds), bySlug("ceramic-mug", newIds)],
    [bySlug("ceramic-mug", newIds), bySlug("executive-notebook", newIds)],
    [bySlug("executive-notebook", newIds), bySlug("metal-pen", newIds)],
    // Gift kits pulling in components
    [bySlug("conference-kit", newIds), bySlug("laptop-backpack", newIds)],
    [bySlug("conference-kit", newIds), bySlug("a5-notebook-diary", newIds)],
  ].filter(([a, b]) => a && b && a !== b);

  if (DRY_RUN) {
    console.log(`[dry-run] related-product links planned: ${links.length}`);
    return links.length;
  }

  let created = 0;
  for (const [productId, relatedProductId] of links) {
    try {
      await prisma.productRelated.upsert({
        where: { productId_relatedProductId: { productId, relatedProductId } },
        update: {},
        create: { productId, relatedProductId, sortOrder: 0 },
      });
      created += 1;
    } catch (err) {
      report.warnings.push(`Related-product link failed (${productId} -> ${relatedProductId}): ${err.message}`);
    }
  }
  console.log(`[backfill] Related-product links created: ${created}`);
  return created;
}

// ── Phase 5 test-data handling (§41/§42) ─────────────────────────────────────

async function handlePhase5TestData() {
  if (DRY_RUN) {
    console.log("[dry-run] would deactivate Phase 5 test categories/colors/products (slugs containing '-p5').");
    report.phase5TestHandling.push("dry-run: would deactivate apparel-p5test/polos-p5test categories, navy-p5test color, and premium-corporate-polo-p5(+copy) products");
    return;
  }

  const testProducts = await prisma.product.findMany({ where: { slug: { contains: "-p5" } } });
  for (const p of testProducts) {
    if (!p.active) continue;
    await prisma.product.update({ where: { id: p.id }, data: { active: false } });
    report.phase5TestHandling.push(`deactivated product "${p.name}" (${p.slug}) — Phase 5 verification test data, not real catalogue`);
  }

  const testCategories = await prisma.category.findMany({ where: { slug: { contains: "-p5test" } } });
  for (const c of testCategories) {
    if (!c.active) continue;
    await prisma.category.update({ where: { id: c.id }, data: { active: false } });
    report.phase5TestHandling.push(`deactivated category "${c.name}" (${c.slug}) — Phase 5 verification test data`);
  }

  const testColors = await prisma.color.findMany({ where: { slug: { contains: "-p5test" } } });
  for (const c of testColors) {
    if (!c.active) continue;
    await prisma.color.update({ where: { id: c.id }, data: { active: false } });
    report.phase5TestHandling.push(`deactivated color "${c.name}" (${c.slug}) — Phase 5 verification test data`);
  }

  if (!testProducts.length && !testCategories.length && !testColors.length) {
    report.phase5TestHandling.push("no active Phase 5 test records found (already handled, or none exist).");
  }
}

// ── Report file (§48) ────────────────────────────────────────────────────────

function writeReport() {
  const reportsDir = path.join(__dirname, "../reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const jsonPath = path.join(reportsDir, "catalog-backfill-report.json");
  const mdPath = path.join(reportsDir, "catalog-backfill-report.md");

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  const md = `# Catalogue Backfill Report

Generated: ${new Date().toISOString()}
Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE IMPORT"}

## Legacy products imported (${report.imported.length})

${report.imported.map((p) => `- **${p.name}** (\`${p.slug}\`) — from legacy "${p.legacyName}", category: ${p.category}, MOQ ${p.moq}, ${p.tierCount} price tiers, ${p.imageCount} images`).join("\n") || "(none)"}

## Legacy products skipped (${report.skipped.length})

${report.skipped.map((s) => `- **${s.name}** — ${s.reason}`).join("\n") || "(none)"}

## New products generated (${report.generated.length})

${report.generated.map((p) => `- **${p.name}** (\`${p.slug}\`) — category: ${p.category}, QUOTE_ONLY pricing`).join("\n") || "(none)"}

## Missing images (${report.missingImage.length})

${report.missingImage.map((n) => `- ${n}`).join("\n") || "(none)"}

## Missing pricing / not imported for that reason (${report.missingPricing.length})

${report.missingPricing.map((n) => `- ${n}`).join("\n") || "(none)"}

## Legacy image references reused: ${report.legacyImageReferencesReused}

## Legacy image references skipped (${report.legacyImageReferencesSkipped.length})

${report.legacyImageReferencesSkipped.map((i) => `- ${i.product}: \`${i.url}\` — ${i.reason}`).join("\n") || "(none)"}

## Phase 5 test-data handling

${report.phase5TestHandling.map((t) => `- ${t}`).join("\n") || "(none)"}

## Warnings (${report.warnings.length})

${report.warnings.map((w) => `- ${w}`).join("\n") || "(none)"}

## Needs review before going live

- **Customization setup**: every product imported/generated this run has \`customizable: false\` — none has a real calibrated customization photo or placement zone (Phase 6A §26/§37 forbid fabricating either). Configure real customization data per-product via the Catalogue Admin before enabling.
- **QUOTE_ONLY pricing on all ${report.generated.length} new products**: no reliable agreed price exists for any of them — review and set real pricing before launch.
- **Legacy image references**: ${report.legacyImageReferencesReused} images point at the OLD production S3 bucket by URL reference only (never copied/moved/re-uploaded). Confirm that bucket's long-term availability plan before relying on these in production.
`;
  fs.writeFileSync(mdPath, md);
  console.log(`[backfill] Report written: ${mdPath}`);
  return { jsonPath, mdPath };
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  assertSafeToRun();
  printTargetDatabase();

  if (!fs.existsSync(LEGACY_DUMP_PATH)) {
    console.error(`[backfill] Legacy dump not found at ${LEGACY_DUMP_PATH}`);
    process.exit(1);
  }

  const legacy = loadLegacyDump(LEGACY_DUMP_PATH);
  report.legacyCategoriesFound = legacy.categories.map((c) => c.name);
  report.legacyProductsFound = legacy.products.length;
  console.log(
    `[backfill] Legacy dump loaded: ${legacy.categories.length} categories, ${legacy.products.length} products, ` +
      `${legacy.pricingSlabs.length} price tiers, ${legacy.productImages.length} images, ${legacy.fabricTypes.length} fabrics, ${legacy.styles.length} styles`,
  );

  const existingSlugs = DRY_RUN
    ? new Set()
    : new Set((await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug));

  const categoryIdByKey = await upsertCategoryTree();
  await upsertColors(); // colors aren't assigned to legacy/new products here — see importLegacyProducts' note
  const tagIdBySlug = await ensureTags();

  const legacyIds = await importLegacyProducts(legacy, categoryIdByKey, tagIdBySlug, existingSlugs);
  const newIds = await createNewProducts(categoryIdByKey, tagIdBySlug, existingSlugs);
  await linkRelatedProducts(legacyIds, newIds);
  await handlePhase5TestData();

  const { mdPath } = writeReport();

  console.log("\n[backfill] Summary:");
  console.log(`  Legacy products imported: ${report.imported.length}`);
  console.log(`  Legacy products skipped:  ${report.skipped.length}`);
  console.log(`  New products generated:   ${report.generated.length}`);
  console.log(`  Images reused:            ${report.legacyImageReferencesReused}`);
  console.log(`  Warnings:                 ${report.warnings.length}`);
  console.log(`  Report:                   ${mdPath}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("[backfill] Fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
