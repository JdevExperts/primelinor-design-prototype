const { effectivePrice } = require("./pricing");

function serializeCategoryRef(category) {
  if (!category) return null;
  return { id: category.id, slug: category.slug, name: category.name };
}

function serializeColorRef(productColor) {
  const c = productColor.color;
  return { id: c.id, slug: c.slug, name: c.name, hex: c.hex };
}

function serializeTier(tier) {
  return { id: tier.id, minQty: tier.minQty, maxQty: tier.maxQty, unitPrice: Number(tier.unitPrice) };
}

function serializeVariant(variant) {
  return { id: variant.id, code: variant.code, label: variant.label };
}

function serializeSpecification(spec) {
  return { label: spec.label, value: spec.value };
}

function serializeAsset(asset) {
  return {
    id: asset.id,
    type: asset.type,
    colorId: asset.colorId,
    url: asset.url,
    alt: asset.alt,
    sortOrder: asset.sortOrder,
    supportsArtworkOverlay: asset.supportsArtworkOverlay,
  };
}

function serializePlacementZone(zone) {
  return {
    id: zone.id,
    colorId: zone.colorId,
    assetId: zone.assetId,
    view: zone.view,
    placementKey: zone.placementKey,
    label: zone.label,
    cx: Number(zone.cx),
    cy: Number(zone.cy),
    width: Number(zone.width),
    height: Number(zone.height),
  };
}

/** List/card shape — no internal-only fields, no heavy relations. */
function serializeProductSummary(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: serializeCategoryRef(product.category),
    material: product.material,
    gsm: product.gsm,
    moq: product.moq,
    unit: product.unit,
    priceMode: product.priceMode,
    fixedPrice: product.fixedPrice != null ? Number(product.fixedPrice) : null,
    effectivePrice: effectivePrice(product),
    priceTiers: (product.priceTiers || []).map(serializeTier),
    customizable: product.customizable,
    colors: (product.colors || []).map(serializeColorRef),
    sortOrder: product.sortOrder,
    createdAt: product.createdAt,
  };
}

/** Full PDP/Studio shape. */
function serializeProductDetail(product) {
  return {
    ...serializeProductSummary(product),
    description: product.description,
    longSpec: product.longSpec,
    variantType: product.variantType,
    variants: (product.variants || []).map(serializeVariant),
    specifications: (product.specifications || []).map(serializeSpecification),
    dispatchEstimate: product.dispatchEstimate,
    assets: (product.assets || []).map(serializeAsset),
    placementZones: (product.placementZones || []).map(serializePlacementZone),
    tags: (product.tags || []).map((productTag) => productTag.tag.slug),
    relatedProducts: (product.relatedFrom || [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((rel) => serializeProductSummary(rel.relatedProduct)),
  };
}

function serializeCategory(category) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    sortOrder: category.sortOrder,
    children: (category.children || [])
      .filter((child) => child.active)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((child) => ({ id: child.id, slug: child.slug, name: child.name, sortOrder: child.sortOrder })),
  };
}

module.exports = {
  serializeProductSummary,
  serializeProductDetail,
  serializeCategory,
};
