-- Product Code: permanent, human-friendly base-product identifier (PL-[TYPE]-[NNN]).
-- Introduced task "PERMANENT PRODUCT CODE SYSTEM". Backfill mirrors prisma/productCodeMap.js.

-- 1. Add columns nullable first so existing rows stay valid mid-migration.
ALTER TABLE "products" ADD COLUMN "product_code" TEXT;
ALTER TABLE "rfq_items" ADD COLUMN "product_code_snapshot" TEXT;
ALTER TABLE "quotation_lines" ADD COLUMN "product_code_snapshot" TEXT;

-- 2. Deterministic backfill of the launch catalogue (46 products).
UPDATE "products" SET "product_code" = 'PL-TS-001' WHERE "slug" = 'biowash-round-neck-t-shirt';
UPDATE "products" SET "product_code" = 'PL-TS-002' WHERE "slug" = 'cotton-round-neck';
UPDATE "products" SET "product_code" = 'PL-TS-003' WHERE "slug" = 'cotton-round-neck-t-shirt-value';
UPDATE "products" SET "product_code" = 'PL-TS-004' WHERE "slug" = 'kids-polyester-t-shirt';
UPDATE "products" SET "product_code" = 'PL-TS-005' WHERE "slug" = 'kids-round-neck-t-shirt';
UPDATE "products" SET "product_code" = 'PL-TS-006' WHERE "slug" = 'value-round-neck-t-shirt';
UPDATE "products" SET "product_code" = 'PL-DF-001' WHERE "slug" = 'dry-fit-performance-t-shirt';
UPDATE "products" SET "product_code" = 'PL-DF-002' WHERE "slug" = 'dry-fit-round-neck-t-shirt';
UPDATE "products" SET "product_code" = 'PL-DF-003' WHERE "slug" = 'dry-fit-sports-t-shirt';
UPDATE "products" SET "product_code" = 'PL-DF-004' WHERE "slug" = 'premium-sports-casual-t-shirt';
UPDATE "products" SET "product_code" = 'PL-OS-001' WHERE "slug" = 'college-batch-oversized-t-shirt';
UPDATE "products" SET "product_code" = 'PL-OS-002' WHERE "slug" = 'oversized-t-shirt';
UPDATE "products" SET "product_code" = 'PL-OS-003' WHERE "slug" = 'premium-terry-oversized-t-shirt';
UPDATE "products" SET "product_code" = 'PL-PO-001' WHERE "slug" = 'eco-polo-t-shirt';
UPDATE "products" SET "product_code" = 'PL-PO-002' WHERE "slug" = 'honeycomb-matty-polo-t-shirt';
UPDATE "products" SET "product_code" = 'PL-PO-003' WHERE "slug" = 'premium-matty-polo-t-shirt';
UPDATE "products" SET "product_code" = 'PL-PO-004' WHERE "slug" = 'premium-micro-polo-t-shirt';
UPDATE "products" SET "product_code" = 'PL-PO-005' WHERE "slug" = 'premium-polo';
UPDATE "products" SET "product_code" = 'PL-PO-006' WHERE "slug" = 'premium-tipping-polo-t-shirt';
UPDATE "products" SET "product_code" = 'PL-PO-007' WHERE "slug" = 'spun-matty-polo-t-shirt';
UPDATE "products" SET "product_code" = 'PL-HD-001' WHERE "slug" = 'pullover-hoodie';
UPDATE "products" SET "product_code" = 'PL-HD-002' WHERE "slug" = 'zipper-hoodie';
UPDATE "products" SET "product_code" = 'PL-UN-001' WHERE "slug" = 'corporate-staff-uniform-tshirt';
UPDATE "products" SET "product_code" = 'PL-UN-002' WHERE "slug" = 'school-uniform-polo-t-shirt';
UPDATE "products" SET "product_code" = 'PL-CP-001' WHERE "slug" = 'classic-cap';
UPDATE "products" SET "product_code" = 'PL-CP-002' WHERE "slug" = 'premium-cap';
UPDATE "products" SET "product_code" = 'PL-BG-001' WHERE "slug" = 'canvas-tote';
UPDATE "products" SET "product_code" = 'PL-BG-002' WHERE "slug" = 'cotton-tote-bag';
UPDATE "products" SET "product_code" = 'PL-BG-003' WHERE "slug" = 'drawstring-bag';
UPDATE "products" SET "product_code" = 'PL-BG-004' WHERE "slug" = 'laptop-backpack';
UPDATE "products" SET "product_code" = 'PL-BT-001' WHERE "slug" = 'corporate-bottle';
UPDATE "products" SET "product_code" = 'PL-BT-002' WHERE "slug" = 'sipper-tumbler';
UPDATE "products" SET "product_code" = 'PL-BT-003' WHERE "slug" = 'vacuum-insulated-bottle';
UPDATE "products" SET "product_code" = 'PL-MG-001' WHERE "slug" = 'ceramic-mug';
UPDATE "products" SET "product_code" = 'PL-PN-001' WHERE "slug" = 'metal-pen';
UPDATE "products" SET "product_code" = 'PL-PN-002' WHERE "slug" = 'plastic-promotional-pen';
UPDATE "products" SET "product_code" = 'PL-NB-001' WHERE "slug" = 'a5-notebook-diary';
UPDATE "products" SET "product_code" = 'PL-NB-002' WHERE "slug" = 'executive-notebook';
UPDATE "products" SET "product_code" = 'PL-VC-001' WHERE "slug" = 'premium-visiting-cards';
UPDATE "products" SET "product_code" = 'PL-CL-001' WHERE "slug" = 'custom-table-calendar';
UPDATE "products" SET "product_code" = 'PL-GK-001' WHERE "slug" = 'conference-kit';
UPDATE "products" SET "product_code" = 'PL-GK-002' WHERE "slug" = 'event-essentials-kit';
UPDATE "products" SET "product_code" = 'PL-GK-003' WHERE "slug" = 'executive-gift-set';
UPDATE "products" SET "product_code" = 'PL-GK-004' WHERE "slug" = 'festival-gift-box';
UPDATE "products" SET "product_code" = 'PL-GK-005' WHERE "slug" = 'welcome-kit';
UPDATE "products" SET "product_code" = 'PL-PM-001' WHERE "slug" = 'promotional-merchandise-kit';

-- 3. Best-effort backfill of historical snapshots from the live product,
--    so existing RFQs / quotation lines also carry a code.
UPDATE "rfq_items" ri SET "product_code_snapshot" = p."product_code"
  FROM "products" p
  WHERE ri."product_code_snapshot" IS NULL
    AND (ri."product_id" = p."id" OR ri."product_slug_snapshot" = p."slug");
UPDATE "quotation_lines" ql SET "product_code_snapshot" = ri."product_code_snapshot"
  FROM "rfq_items" ri
  WHERE ql."product_code_snapshot" IS NULL AND ql."rfq_item_id" = ri."id";

-- 4. Enforce: every product has a code, globally unique.
ALTER TABLE "products" ALTER COLUMN "product_code" SET NOT NULL;
CREATE UNIQUE INDEX "products_product_code_key" ON "products"("product_code");
