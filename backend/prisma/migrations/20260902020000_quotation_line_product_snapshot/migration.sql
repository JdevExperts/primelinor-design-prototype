-- Sales Quotation Workspace (Phase B): a quotation PRODUCT line now carries
-- its own product identity + name snapshot, so historical quotations never
-- depend on live catalogue rows (§18/§59). Nullable — SHIPPING/DISCOUNT/
-- ADJUSTMENT and pre-existing custom lines legitimately have no product.

ALTER TABLE "quotation_lines" ADD COLUMN "product_id" TEXT;
ALTER TABLE "quotation_lines" ADD COLUMN "product_name_snapshot" TEXT;

-- Backfill from the linked RFQ item where one exists.
UPDATE "quotation_lines" ql
SET "product_id" = ri."product_id",
    "product_name_snapshot" = ri."product_name_snapshot"
FROM "rfq_items" ri
WHERE ql."rfq_item_id" = ri."id"
  AND ql."product_name_snapshot" IS NULL;
