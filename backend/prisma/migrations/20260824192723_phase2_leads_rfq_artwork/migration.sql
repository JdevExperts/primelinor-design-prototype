-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'IN_REVIEW', 'CONVERTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RfqStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'QUOTED', 'NEGOTIATING', 'WON', 'LOST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ArtworkStatus" AS ENUM ('PENDING', 'ATTACHED', 'DELETED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('HEADER_QUOTE', 'PDP', 'CUSTOMIZATION_STUDIO', 'CORPORATE_GIFTING', 'KIT_BUILDER', 'SOLUTION', 'CONTACT', 'ABOUT', 'OTHER');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phone_raw" TEXT NOT NULL,
    "email" TEXT,
    "company_id" TEXT,
    "company_name_raw" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source_type" "SourceType" NOT NULL,
    "source_path" TEXT NOT NULL,
    "source_context" JSONB,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "message" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "assigned_to_user_id" TEXT,
    "converted_rfq_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfqs" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "status" "RfqStatus" NOT NULL DEFAULT 'NEW',
    "source_type" "SourceType" NOT NULL,
    "source_path" TEXT NOT NULL,
    "source_context" JSONB,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "message" TEXT,
    "delivery_city" TEXT,
    "delivery_pin" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "requirement_data" JSONB,
    "submission_id" TEXT NOT NULL,
    "assigned_to_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_items" (
    "id" TEXT NOT NULL,
    "rfq_id" TEXT NOT NULL,
    "product_id" TEXT,
    "description" TEXT,
    "product_name_snapshot" TEXT,
    "product_slug_snapshot" TEXT,
    "spec_snapshot" TEXT,
    "color_id" TEXT,
    "color_name_snapshot" TEXT,
    "variant_id" TEXT,
    "variant_label_snapshot" TEXT,
    "unit_snapshot" TEXT,
    "pricing_mode_snapshot" TEXT,
    "quantity" INTEGER,
    "estimated_unit_price" DECIMAL(10,2),
    "estimated_total" DECIMAL(10,2),
    "customization_data" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_activity" (
    "id" TEXT NOT NULL,
    "rfq_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL,
    "actor_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfq_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artwork_assets" (
    "id" TEXT NOT NULL,
    "status" "ArtworkStatus" NOT NULL DEFAULT 'PENDING',
    "original_file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "preview_storage_key" TEXT,
    "expires_at" TIMESTAMP(3),
    "rfq_item_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attached_at" TIMESTAMP(3),

    CONSTRAINT "artwork_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contacts_phone_key" ON "contacts"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "leads_reference_key" ON "leads"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "leads_submission_id_key" ON "leads"("submission_id");

-- CreateIndex
CREATE INDEX "leads_contact_id_idx" ON "leads"("contact_id");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rfqs_reference_key" ON "rfqs"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "rfqs_submission_id_key" ON "rfqs"("submission_id");

-- CreateIndex
CREATE INDEX "rfqs_contact_id_idx" ON "rfqs"("contact_id");

-- CreateIndex
CREATE INDEX "rfqs_status_idx" ON "rfqs"("status");

-- CreateIndex
CREATE INDEX "rfq_items_rfq_id_idx" ON "rfq_items"("rfq_id");

-- CreateIndex
CREATE INDEX "rfq_activity_rfq_id_idx" ON "rfq_activity"("rfq_id");

-- CreateIndex
CREATE INDEX "artwork_assets_status_idx" ON "artwork_assets"("status");

-- CreateIndex
CREATE INDEX "artwork_assets_expires_at_idx" ON "artwork_assets"("expires_at");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_activity" ADD CONSTRAINT "rfq_activity_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artwork_assets" ADD CONSTRAINT "artwork_assets_rfq_item_id_fkey" FOREIGN KEY ("rfq_item_id") REFERENCES "rfq_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Reference-number sequences (Phase 2 §9). Plain integer sequences,
-- formatted into human-friendly references ("PL-LD-2026-000123",
-- "PL-RQ-2026-000123") in application code — see
-- src/services/referenceNumber.js. Real Postgres sequences guarantee no
-- collision under concurrent submissions, which a max()+1 read would not.
CREATE SEQUENCE IF NOT EXISTS lead_reference_seq START 1;
CREATE SEQUENCE IF NOT EXISTS rfq_reference_seq START 1;
