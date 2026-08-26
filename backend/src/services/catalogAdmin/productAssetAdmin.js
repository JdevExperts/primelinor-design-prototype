/**
 * Product image management — separate from customer ArtworkAsset (Phase 5
 * §27): these are permanent, admin-managed, public catalogue content, not
 * a private per-RFQ upload with a TTL. Two creation paths share one
 * concept: a new file upload (stored in the new `products/<id>/...`
 * namespace) or a reference to an existing URL (Phase 5 §29, for manually
 * recreating the old catalogue from already-live production images without
 * re-uploading them).
 *
 * `storageKey` is the deletion-rights signal (Phase 5 §31): populated only
 * for assets THIS system uploaded, left null for URL-only external
 * references — so deleteAsset() can safely know whether it's allowed to
 * also remove the underlying object, and an old production S3 object
 * referenced by URL alone is never touched.
 */
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const storage = require("../storage/productAssets");
const { validateUploadedProductImage } = require("../productAssetValidation");

async function assertProductExists(productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound("Product not found.");
  return product;
}

async function assertAssetBelongsToProduct(productId, assetId) {
  const asset = await prisma.productAsset.findUnique({ where: { id: assetId } });
  if (!asset || asset.productId !== productId) throw ApiError.notFound("Asset not found.");
  return asset;
}

async function assertColorValid(colorId) {
  if (!colorId) return;
  const color = await prisma.color.findUnique({ where: { id: colorId } });
  if (!color) throw ApiError.badRequest("Color does not exist.");
}

async function createAssetFromUpload(productId, file, meta) {
  await assertProductExists(productId);
  await assertColorValid(meta.colorId);

  const result = validateUploadedProductImage(file);
  if (!result.ok) throw ApiError.badRequest(result.message);

  const key = storage.generateProductAssetKey(productId, file.originalname);
  await storage.putObject({ buffer: file.buffer, contentType: result.mimeType, key });
  const url = storage.buildPublicUrl(key);

  return prisma.productAsset.create({
    data: {
      productId,
      type: meta.type,
      colorId: meta.colorId ?? null,
      storageKey: key,
      url,
      alt: meta.alt ?? null,
      sortOrder: meta.sortOrder ?? 0,
      active: meta.active ?? true,
      supportsArtworkOverlay: meta.supportsArtworkOverlay ?? false,
    },
  });
}

async function createAssetFromUrl(productId, data) {
  await assertProductExists(productId);
  await assertColorValid(data.colorId);

  return prisma.productAsset.create({
    data: {
      productId,
      type: data.type,
      colorId: data.colorId ?? null,
      storageKey: null,
      url: data.url,
      alt: data.alt ?? null,
      sortOrder: data.sortOrder ?? 0,
      active: data.active ?? true,
      supportsArtworkOverlay: data.supportsArtworkOverlay ?? false,
    },
  });
}

async function updateAsset(productId, assetId, data) {
  await assertAssetBelongsToProduct(productId, assetId);
  await assertColorValid(data.colorId);

  return prisma.productAsset.update({
    where: { id: assetId },
    data: {
      ...(data.type !== undefined && { type: data.type }),
      ...(data.colorId !== undefined && { colorId: data.colorId }),
      ...(data.alt !== undefined && { alt: data.alt }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.supportsArtworkOverlay !== undefined && { supportsArtworkOverlay: data.supportsArtworkOverlay }),
    },
  });
}

/**
 * Removes the ProductAsset row (association) always. Only deletes the
 * underlying object when this system owns it (`storageKey` set) — an
 * external URL-only reference is never deleted from storage (Phase 5 §31).
 */
async function deleteAsset(productId, assetId) {
  const asset = await assertAssetBelongsToProduct(productId, assetId);
  await prisma.productAsset.delete({ where: { id: assetId } });
  if (asset.storageKey) {
    await storage.deleteObject(asset.storageKey);
  }
  return { managedUploadDeleted: Boolean(asset.storageKey) };
}

module.exports = { createAssetFromUpload, createAssetFromUrl, updateAsset, deleteAsset };
