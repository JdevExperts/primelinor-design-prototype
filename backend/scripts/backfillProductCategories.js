#!/usr/bin/env node
/**
 * One-time data migration (Solutions Phase 0, step between the two
 * product_category_m2m migrations): reads each Product's OLD `category_id`
 * column (still present on disk at this point, but no longer in
 * schema.prisma — read via raw SQL since the generated client has no
 * `categoryId` field anymore) and, for every product:
 *   - sets the new `primaryCategoryId` to that same category
 *   - creates a matching ProductCategory row (so the product has exactly
 *     one category membership immediately after migration, preserving its
 *     current category exactly — no product silently changes category)
 *
 * Idempotent: uses upsert semantics (skips a product that already has
 * primaryCategoryId set, and upserts the ProductCategory row), so a rerun
 * is always safe.
 *
 * Usage:
 *   node scripts/backfillProductCategories.js --dry-run
 *   node scripts/backfillProductCategories.js
 */
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const prisma = require("../src/lib/prisma");
const { assertBackfillAllowed } = require("../src/utils/backfillGuard");

const DRY_RUN = process.argv.includes("--dry-run");

function assertSafeToRun() {
  try {
    assertBackfillAllowed(process.env, { flagName: "ALLOW_PRODUCT_CATEGORY_BACKFILL", dryRun: DRY_RUN, label: "backfill-product-categories" });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

async function main() {
  assertSafeToRun();

  const rows = await prisma.$queryRawUnsafe(
    `SELECT id, category_id, primary_category_id FROM products ORDER BY created_at ASC`,
  );

  let updated = 0;
  let mappingsCreated = 0;
  let alreadyDone = 0;

  for (const row of rows) {
    if (row.primary_category_id) {
      alreadyDone += 1;
      continue;
    }
    if (DRY_RUN) {
      console.log(`[dry-run] product ${row.id}: primaryCategoryId <- ${row.category_id}, + ProductCategory(${row.category_id})`);
      updated += 1;
      mappingsCreated += 1;
      continue;
    }

    await prisma.$transaction([
      prisma.$executeRawUnsafe(`UPDATE products SET primary_category_id = $1 WHERE id = $2`, row.category_id, row.id),
      prisma.productCategory.upsert({
        where: { productId_categoryId: { productId: row.id, categoryId: row.category_id } },
        update: {},
        create: { productId: row.id, categoryId: row.category_id, sortOrder: 0 },
      }),
    ]);
    updated += 1;
    mappingsCreated += 1;
  }

  console.log(`[backfill-product-categories] Products total: ${rows.length}`);
  console.log(`[backfill-product-categories] Already had primaryCategoryId (skipped): ${alreadyDone}`);
  console.log(`[backfill-product-categories] Updated: ${updated}`);
  console.log(`[backfill-product-categories] ProductCategory rows created/confirmed: ${mappingsCreated}`);

  if (!DRY_RUN) await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[backfill-product-categories] Fatal error:", err);
  process.exitCode = 1;
});
