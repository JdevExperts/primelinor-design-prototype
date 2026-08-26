/**
 * Category image management — mirrors productAssetAdmin.js's ownership
 * model: `imageStorageKey` is set only for an object THIS system
 * uploaded, so we always know whether we're allowed to delete the
 * underlying S3/local object. A category only ever has one image (a
 * marketing/navigation visual, not a gallery), so "replace" here means
 * upload-then-swap rather than managing a collection.
 */
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const storage = require("../storage/categoryAssets");
const { validateUploadedProductImage } = require("../productAssetValidation");

async function assertCategoryExists(categoryId) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw ApiError.notFound("Category not found.");
  return category;
}

/**
 * Safe replacement (Phase 6A.1 follow-up §14): upload the new object under
 * a new key, update the DB row, and only THEN delete the previous object —
 * and only if this system owned it (`imageStorageKey` was set). A
 * category whose image was never uploaded through this system (there is
 * no such path today, but the check costs nothing and matches
 * ProductAsset's same discipline) is left untouched in storage.
 */
async function setCategoryImage(categoryId, file, meta = {}) {
  const category = await assertCategoryExists(categoryId);

  const result = validateUploadedProductImage(file);
  if (!result.ok) throw ApiError.badRequest(result.message);

  const key = storage.generateCategoryAssetKey(categoryId, file.originalname);
  await storage.putObject({ buffer: file.buffer, contentType: result.mimeType, key });
  const url = storage.buildPublicUrl(key);

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      imageUrl: url,
      imageStorageKey: key,
      ...(meta.alt !== undefined && { imageAlt: meta.alt }),
    },
  });

  if (category.imageStorageKey && category.imageStorageKey !== key) {
    await storage.deleteObject(category.imageStorageKey);
  }

  return updated;
}

/** Clears the image reference; only deletes the underlying object if this system owned it. */
async function removeCategoryImage(categoryId) {
  const category = await assertCategoryExists(categoryId);

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: { imageUrl: null, imageStorageKey: null, imageAlt: null },
  });

  if (category.imageStorageKey) {
    await storage.deleteObject(category.imageStorageKey);
  }

  return updated;
}

module.exports = { setCategoryImage, removeCategoryImage };
