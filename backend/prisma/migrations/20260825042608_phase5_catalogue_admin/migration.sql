-- AlterTable
ALTER TABLE "products" ADD COLUMN     "created_by_user_id" TEXT,
ADD COLUMN     "quote_above_qty" INTEGER,
ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_title" TEXT,
ADD COLUMN     "updated_by_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
