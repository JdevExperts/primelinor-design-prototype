-- Generic Product Attribute framework + the temporary PRODUCT_REVIEW_PENDING
-- flag. Forward-only, additive. Config seed + per-product backfill are
-- idempotent (ON CONFLICT), so re-running is a no-op.

CREATE TYPE "ProductAttributeValueType" AS ENUM ('BOOLEAN', 'STRING', 'NUMBER', 'JSON');

CREATE TABLE "product_attribute_configs" (
  "id"          TEXT NOT NULL,
  "key"         TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "value_type"  "ProductAttributeValueType" NOT NULL,
  "description" TEXT,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_attribute_configs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "product_attribute_configs_key_key" ON "product_attribute_configs"("key");

CREATE TABLE "product_attributes" (
  "id"           TEXT NOT NULL,
  "attribute_id" TEXT NOT NULL,
  "product_id"   TEXT NOT NULL,
  "value"        JSONB NOT NULL,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "product_attributes_product_id_attribute_id_key"
  ON "product_attributes"("product_id", "attribute_id");
CREATE INDEX "product_attributes_attribute_id_idx" ON "product_attributes"("attribute_id");
CREATE INDEX "product_attributes_product_id_idx" ON "product_attributes"("product_id");

ALTER TABLE "product_attributes"
  ADD CONSTRAINT "product_attributes_attribute_id_fkey"
  FOREIGN KEY ("attribute_id") REFERENCES "product_attribute_configs"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "product_attributes"
  ADD CONSTRAINT "product_attributes_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- The one required config for this phase.
INSERT INTO "product_attribute_configs" ("id", "key", "name", "value_type", "description", "created_at", "updated_at")
VALUES (
  gen_random_uuid(),
  'PRODUCT_REVIEW_PENDING',
  'Product Review Pending',
  'BOOLEAN',
  'Marks products that still require manual catalogue review.',
  now(), now()
)
ON CONFLICT ("key") DO NOTHING;

-- Backfill: every existing product starts as "review pending". Idempotent
-- via the (product_id, attribute_id) unique index.
INSERT INTO "product_attributes" ("id", "attribute_id", "product_id", "value", "created_at", "updated_at")
SELECT gen_random_uuid(), c."id", p."id", 'true'::jsonb, now(), now()
FROM "products" p
CROSS JOIN "product_attribute_configs" c
WHERE c."key" = 'PRODUCT_REVIEW_PENDING'
ON CONFLICT ("product_id", "attribute_id") DO NOTHING;
