-- Quotation module independence (P0 + core P1). Forward-only, additive,
-- non-destructive. Existing rows keep their current status/origin.

-- ── New enum values ───────────────────────────────────────────────────
ALTER TYPE "QuotationStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
ALTER TYPE "QuotationOrigin" ADD VALUE IF NOT EXISTS 'PHONE';
ALTER TYPE "QuotationOrigin" ADD VALUE IF NOT EXISTS 'WHATSAPP';
ALTER TYPE "QuotationOrigin" ADD VALUE IF NOT EXISTS 'OFFLINE';

-- ── Quotation: origin detail + staff cancellation bookkeeping ─────────
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "origin_detail" TEXT;
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP(3);
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "cancel_reason" TEXT;

-- ── InternalNote: allow attaching to a quotation lineage ──────────────
ALTER TABLE "internal_notes" ALTER COLUMN "rfq_id" DROP NOT NULL;
ALTER TABLE "internal_notes" ADD COLUMN IF NOT EXISTS "quotation_id" TEXT;
ALTER TABLE "internal_notes" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3);
UPDATE "internal_notes" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;
ALTER TABLE "internal_notes" ALTER COLUMN "updated_at" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "internal_notes_quotation_id_idx" ON "internal_notes"("quotation_id");

ALTER TABLE "internal_notes"
  ADD CONSTRAINT "internal_notes_quotation_id_fkey"
  FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
