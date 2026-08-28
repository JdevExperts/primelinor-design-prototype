-- CreateTable
CREATE TABLE "solutions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eyebrow" TEXT,
    "hubDescription" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroCopy" TEXT NOT NULL,
    "challengeTitle" TEXT,
    "challengeCopy" TEXT,
    "challengePoints" JSONB,
    "useCases" JSONB,
    "benefits" JSONB,
    "processSteps" JSONB,
    "featureSections" JSONB,
    "finalCta" JSONB,
    "primaryCtaLabel" TEXT,
    "secondaryCtaLabel" TEXT,
    "secondaryCtaTo" TEXT,
    "proof_testimonial_id" TEXT,
    "art" TEXT,
    "color" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "featured_on_home" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "image_storage_key" TEXT,
    "image_alt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solution_products" (
    "id" TEXT NOT NULL,
    "solution_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "solution_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solutions_slug_key" ON "solutions"("slug");

-- CreateIndex
CREATE INDEX "solutions_active_idx" ON "solutions"("active");

-- CreateIndex
CREATE INDEX "solution_products_product_id_idx" ON "solution_products"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "solution_products_solution_id_product_id_key" ON "solution_products"("solution_id", "product_id");

-- AddForeignKey
ALTER TABLE "solution_products" ADD CONSTRAINT "solution_products_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_products" ADD CONSTRAINT "solution_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
