-- Sales Quotation Workspace — Phases C (RFQ working requirement) + E
-- (standalone MANUAL quotations). Forward-only, non-destructive.

-- ── Phase C: RFQ working requirement ───────────────────────────────────
CREATE TABLE "rfq_working_items" (
  "id"                     TEXT NOT NULL,
  "rfq_id"                 TEXT NOT NULL,
  "product_id"             TEXT,
  "product_code_snapshot"  TEXT,
  "product_name_snapshot"  TEXT,
  "description"            TEXT,
  "quantity"              INTEGER,
  "unit"                  TEXT,
  "spec_snapshot"          TEXT,
  "color_name_snapshot"    TEXT,
  "variant_label_snapshot" TEXT,
  "sort_order"             INTEGER NOT NULL DEFAULT 0,
  "created_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"             TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rfq_working_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "rfq_working_items_rfq_id_idx" ON "rfq_working_items"("rfq_id");
ALTER TABLE "rfq_working_items"
  ADD CONSTRAINT "rfq_working_items_rfq_id_fkey"
  FOREIGN KEY ("rfq_id") REFERENCES "rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed working items from the current customer submission for every RFQ.
INSERT INTO "rfq_working_items" (
  "id", "rfq_id", "product_id", "product_code_snapshot", "product_name_snapshot",
  "description", "quantity", "unit", "spec_snapshot", "color_name_snapshot",
  "variant_label_snapshot", "sort_order", "created_at", "updated_at"
)
SELECT
  gen_random_uuid(), ri."rfq_id", ri."product_id", ri."product_code_snapshot",
  ri."product_name_snapshot", ri."description", ri."quantity", ri."unit_snapshot",
  ri."spec_snapshot", ri."color_name_snapshot", ri."variant_label_snapshot",
  ri."sort_order", ri."created_at", ri."created_at"
FROM "rfq_items" ri;

-- ── Phase E: MANUAL quotations ────────────────────────────────────────
CREATE TYPE "QuotationOrigin" AS ENUM ('RFQ', 'MANUAL');
CREATE SEQUENCE IF NOT EXISTS "quotation_reference_seq" START 1;

ALTER TABLE "quotations" ADD COLUMN "origin_type" "QuotationOrigin" NOT NULL DEFAULT 'RFQ';
ALTER TABLE "quotations" ADD COLUMN "quotation_group_id" TEXT;
ALTER TABLE "quotations" ADD COLUMN "group_reference" TEXT;
ALTER TABLE "quotations" ADD COLUMN "party_name" TEXT;
ALTER TABLE "quotations" ADD COLUMN "party_contact_person" TEXT;
ALTER TABLE "quotations" ADD COLUMN "party_phone" TEXT;
ALTER TABLE "quotations" ADD COLUMN "party_email" TEXT;
ALTER TABLE "quotations" ADD COLUMN "party_gstin" TEXT;
ALTER TABLE "quotations" ADD COLUMN "party_address" TEXT;

-- Existing quotations: one lineage per RFQ, so group id = rfq id.
UPDATE "quotations" SET "quotation_group_id" = "rfq_id" WHERE "quotation_group_id" IS NULL;

-- Backfill the party snapshot from the RFQ's contact/company.
UPDATE "quotations" q SET
  "party_name" = COALESCE(co."name", c."company_name_raw", cmp."name"),
  "party_contact_person" = co."name",
  "party_phone" = co."phone_raw",
  "party_email" = co."email"
FROM "rfqs" r
JOIN "contacts" co ON co."id" = r."contact_id"
LEFT JOIN "companies" cmp ON cmp."id" = co."company_id"
LEFT JOIN "contacts" c ON c."id" = r."contact_id"
WHERE q."rfq_id" = r."id" AND q."party_name" IS NULL;

ALTER TABLE "quotations" ALTER COLUMN "quotation_group_id" SET NOT NULL;
ALTER TABLE "quotations" ALTER COLUMN "rfq_id" DROP NOT NULL;

DROP INDEX IF EXISTS "quotations_rfq_id_version_key";
CREATE UNIQUE INDEX "quotations_quotation_group_id_version_key" ON "quotations"("quotation_group_id", "version");
CREATE INDEX "quotations_quotation_group_id_idx" ON "quotations"("quotation_group_id");
CREATE INDEX "quotations_status_idx" ON "quotations"("status");

-- ── RFQ activity: allow quotation-scoped events (MANUAL quote lifecycle) ─
ALTER TABLE "rfq_activity" ALTER COLUMN "rfq_id" DROP NOT NULL;
ALTER TABLE "rfq_activity" ADD COLUMN "quotation_id" TEXT;
CREATE INDEX "rfq_activity_quotation_id_idx" ON "rfq_activity"("quotation_id");
ALTER TABLE "rfq_activity"
  ADD CONSTRAINT "rfq_activity_quotation_id_fkey"
  FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
