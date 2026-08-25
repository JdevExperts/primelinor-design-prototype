/**
 * Resolves one submitted RFQ item into RFQItem create data: looks up the
 * real catalogue rows (Product by slug, Color by slug, ProductVariant by
 * code — the frontend's canonical ids ARE the slug/code, see
 * src/api/adapters.js on the frontend), snapshots their current
 * name/label/spec, and computes the server-authoritative price estimate.
 * Never trusts a client-submitted price (Phase 2 §12).
 *
 * `customizationData.{front,back}.placementKey` is stored as submitted,
 * not validated against PlacementZone: no seeded product has calibrated
 * PlacementZone rows yet (that data drives overlay positioning, a separate
 * concern from intake), so Customization Studio still submits placement
 * keys from its own local vocabulary. What IS validated is
 * artworkAssetId — it must reference a PENDING ArtworkAsset, which this
 * function attaches (PENDING -> ATTACHED) as part of the caller's
 * transaction, preventing the same upload from being attached twice.
 */
const ApiError = require("../utils/ApiError");
const { computeEstimateForQuantity } = require("./pricingEstimate");

async function resolveCustomizationSide(tx, rfqItemId, side) {
  if (!side || !side.enabled) return null;

  let artworkAssetId = null;
  if (side.artworkAssetId) {
    const artwork = await tx.artworkAsset.findUnique({ where: { id: side.artworkAssetId } });
    if (!artwork || artwork.status !== "PENDING") {
      throw ApiError.badRequest("One of the artwork files referenced is invalid or already used.");
    }
    await tx.artworkAsset.update({
      where: { id: artwork.id },
      data: { status: "ATTACHED", rfqItemId, attachedAt: new Date() },
    });
    artworkAssetId = artwork.id;
  }

  return {
    enabled: true,
    placementKey: side.placementKey || null,
    artworkAssetId,
  };
}

async function resolveRfqItem(tx, rfqId, item, sortOrder) {
  let product = null;
  let color = null;
  let variant = null;

  if (item.productId) {
    product = await tx.product.findUnique({
      where: { slug: item.productId },
      include: { priceTiers: true, colors: { include: { color: true } }, variants: true },
    });
    if (!product || !product.active) {
      throw ApiError.badRequest(`Product "${item.productId}" is not available.`);
    }

    if (item.colorId) {
      const match = product.colors.find((c) => c.color.slug === item.colorId);
      if (!match) {
        throw ApiError.badRequest(`Color "${item.colorId}" is not available for this product.`);
      }
      color = match.color;
    }

    if (item.variantId) {
      variant = product.variants.find((v) => v.code === item.variantId && v.active);
      if (!variant) {
        throw ApiError.badRequest(`Option "${item.variantId}" is not available for this product.`);
      }
    }

    if (item.quantity != null && item.quantity < product.moq) {
      throw ApiError.badRequest(
        `Quantity for "${product.name}" is below the minimum order quantity (${product.moq}).`,
      );
    }
  }

  const estimate =
    product && item.quantity != null
      ? computeEstimateForQuantity(product, item.quantity)
      : { unitPrice: null, total: null };

  // The RFQItem row doesn't exist yet (its id is needed to attach artwork),
  // so it's created first with customizationData null, then patched once
  // artwork resolution — which needs the real id — completes.
  const created = await tx.rFQItem.create({
    data: {
      rfqId,
      productId: product?.id || null,
      description: item.description || null,
      productNameSnapshot: product?.name || null,
      productSlugSnapshot: product?.slug || null,
      specSnapshot: product?.longSpec || product?.description || null,
      colorId: color?.id || null,
      colorNameSnapshot: color?.name || null,
      variantId: variant?.id || null,
      variantLabelSnapshot: variant?.label || null,
      unitSnapshot: product?.unit || null,
      pricingModeSnapshot: product?.priceMode || null,
      quantity: item.quantity ?? null,
      estimatedUnitPrice: estimate.unitPrice,
      estimatedTotal: estimate.total,
      sortOrder,
    },
  });

  const customizationData = item.customizationData
    ? {
        front: await resolveCustomizationSide(tx, created.id, item.customizationData.front),
        back: await resolveCustomizationSide(tx, created.id, item.customizationData.back),
      }
    : null;

  if (customizationData) {
    await tx.rFQItem.update({ where: { id: created.id }, data: { customizationData } });
  }

  return created.id;
}

module.exports = { resolveRfqItem };
