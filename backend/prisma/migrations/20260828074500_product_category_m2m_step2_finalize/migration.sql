-- Step 2 of 2 (Solutions Phase 0): scripts/backfillProductCategories.js has
-- already populated `primary_category_id` and a matching `product_categories`
-- row for every existing product (verified: 0 null primary_category_id, 0
-- drift from the old category_id, exactly one mapping per product). Safe
-- now to enforce NOT NULL and retire the old single-category column.

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_fkey";

-- DropIndex
DROP INDEX "products_category_id_idx";

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "primary_category_id" SET NOT NULL;

ALTER TABLE "products" DROP COLUMN "category_id";
