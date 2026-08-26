const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");

async function assertProductExists(productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound("Product not found.");
}

async function assertZoneBelongsToProduct(productId, zoneId) {
  const zone = await prisma.placementZone.findUnique({ where: { id: zoneId } });
  if (!zone || zone.productId !== productId) throw ApiError.notFound("Placement zone not found.");
  return zone;
}

async function assertRefsValid(productId, { colorId, assetId }) {
  if (colorId) {
    const color = await prisma.color.findUnique({ where: { id: colorId } });
    if (!color) throw ApiError.badRequest("Color does not exist.");
  }
  if (assetId) {
    const asset = await prisma.productAsset.findUnique({ where: { id: assetId } });
    if (!asset || asset.productId !== productId) throw ApiError.badRequest("Asset does not belong to this product.");
  }
}

async function createZone(productId, data) {
  await assertProductExists(productId);
  await assertRefsValid(productId, data);

  return prisma.placementZone.create({
    data: {
      productId,
      view: data.view,
      placementKey: data.placementKey,
      label: data.label,
      cx: data.cx,
      cy: data.cy,
      width: data.width,
      height: data.height,
      colorId: data.colorId ?? null,
      assetId: data.assetId ?? null,
      active: data.active ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

async function updateZone(productId, zoneId, data) {
  await assertZoneBelongsToProduct(productId, zoneId);
  await assertRefsValid(productId, data);

  return prisma.placementZone.update({
    where: { id: zoneId },
    data: {
      ...(data.view !== undefined && { view: data.view }),
      ...(data.placementKey !== undefined && { placementKey: data.placementKey }),
      ...(data.label !== undefined && { label: data.label }),
      ...(data.cx !== undefined && { cx: data.cx }),
      ...(data.cy !== undefined && { cy: data.cy }),
      ...(data.width !== undefined && { width: data.width }),
      ...(data.height !== undefined && { height: data.height }),
      ...(data.colorId !== undefined && { colorId: data.colorId }),
      ...(data.assetId !== undefined && { assetId: data.assetId }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });
}

async function deleteZone(productId, zoneId) {
  await assertZoneBelongsToProduct(productId, zoneId);
  await prisma.placementZone.delete({ where: { id: zoneId } });
}

module.exports = { createZone, updateZone, deleteZone };
