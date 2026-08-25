-- AlterTable
ALTER TABLE "quotations"
  ADD COLUMN "access_token_hash" TEXT,
  ADD COLUMN "access_token_created_at" TIMESTAMP(3),
  ADD COLUMN "access_token_revoked_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "quotations_access_token_hash_key" ON "quotations"("access_token_hash");
