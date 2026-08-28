/**
 * Admin-facing catalogue serializers — distinct from services/serialize.js
 * (the public shape): these expose internal fields (active state
 * regardless of value, createdBy/updatedBy, full unfiltered child lists)
 * that the public API deliberately hides.
 */
const { effectivePrice } = require("./pricing");
const { selectPrimaryImage } = require("./productImageSelection");

function serializeCategoryAdmin(category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentCategoryId: category.parentCategoryId,
    active: category.active,
    sortOrder: category.sortOrder,
    // storageKey stays internal (deletion-ownership bookkeeping only) —
    // even the admin UI only ever needs url/alt to preview/manage it.
    image: category.imageUrl ? { url: category.imageUrl, alt: category.imageAlt } : null,
    // Only present when the caller (categoryAdmin.listCategoriesAdmin)
    // computed them — Category Admin completeness improvements (Solutions
    // Phase A §22): direct active product count and leaf/parent state, so
    // the list can badge "an active leaf has no products" without a second
    // round trip.
    isLeaf: category.isLeaf,
    activeProductCount: category.activeProductCount,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

function serializeColorAdmin(color) {
  return {
    id: color.id,
    name: color.name,
    slug: color.slug,
    hex: color.hex,
    active: color.active,
    sortOrder: color.sortOrder,
  };
}

function serializeTagAdmin(tag) {
  return { id: tag.id, name: tag.name, slug: tag.slug };
}

/**
 * Deterministic catalogue-image rule — CATALOG preferred, then
 * GALLERY_FRONT, then the first active asset by sortOrder (Phase 6A.1
 * §2/§30). Shared with the public serializer (services/serialize.js) via
 * productImageSelection.js so the admin thumbnail and every customer-
 * facing card agree on the same product's image.
 */
function pickThumbnail(product) {
  return selectPrimaryImage(product.assets);
}

/** "₹149–₹139 / pc" / "₹349" / "Quote Only" — no fake sale pricing (Phase 5 §25). */
function priceSummary(product) {
  if (product.priceMode === "QUOTE_ONLY") return "Quote Only";
  if (product.priceMode === "FIXED") {
    return product.fixedPrice != null ? `₹${Number(product.fixedPrice).toFixed(0)}` : "—";
  }
  const tiers = product.priceTiers || [];
  if (!tiers.length) return "—";
  const prices = tiers.map((t) => Number(t.unitPrice));
  const entry = tiers.reduce((lowest, t) => (t.minQty < lowest.minQty ? t : lowest));
  const cheapest = Math.min(...prices);
  if (Number(entry.unitPrice) === cheapest) return `₹${Number(entry.unitPrice).toFixed(0)}`;
  return `₹${Number(entry.unitPrice).toFixed(0)}–₹${cheapest.toFixed(0)}`;
}

function serializeCategoryRefAdmin(category) {
  if (!category) return null;
  return { id: category.id, slug: category.slug, name: category.name, active: category.active };
}

function serializeProductAdminSummary(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    primaryCategory: serializeCategoryRefAdmin(product.primaryCategory),
    categoryCount: (product.categories || []).length,
    thumbnail: pickThumbnail(product),
    priceMode: product.priceMode,
    priceSummary: priceSummary(product),
    moq: product.moq,
    unit: product.unit,
    customizable: product.customizable,
    active: product.active,
    sortOrder: product.sortOrder,
    updatedAt: product.updatedAt,
  };
}

function serializeAssetAdmin(asset) {
  return {
    id: asset.id,
    type: asset.type,
    colorId: asset.colorId,
    url: asset.url,
    alt: asset.alt,
    sortOrder: asset.sortOrder,
    active: asset.active,
    supportsArtworkOverlay: asset.supportsArtworkOverlay,
    isManagedUpload: Boolean(asset.storageKey),
    createdAt: asset.createdAt,
  };
}

function serializePlacementZoneAdmin(zone) {
  return {
    id: zone.id,
    view: zone.view,
    placementKey: zone.placementKey,
    label: zone.label,
    cx: Number(zone.cx),
    cy: Number(zone.cy),
    width: Number(zone.width),
    height: Number(zone.height),
    colorId: zone.colorId,
    assetId: zone.assetId,
    active: zone.active,
    sortOrder: zone.sortOrder,
  };
}

/**
 * customizable=true with no usable customization setup is a soft warning,
 * not a save-blocker (Phase 5 §39) — surfaced to the admin editor as a
 * flag, not enforced server-side beyond that.
 */
function customizationIncomplete(product) {
  if (!product.customizable) return false;
  const hasCustomizationAsset = (product.assets || []).some(
    (a) => a.active && (a.type === "CUSTOMIZATION_FRONT" || a.type === "CUSTOMIZATION_BACK"),
  );
  const hasActiveZone = (product.placementZones || []).some((z) => z.active);
  return !hasCustomizationAsset || !hasActiveZone;
}

function serializeProductAdminDetail(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    primaryCategoryId: product.primaryCategoryId,
    primaryCategory: serializeCategoryRefAdmin(product.primaryCategory),
    // Every ProductCategory membership (primary included), ordered — the
    // Product Editor's "Primary Category" single-select + "Additional
    // Categories" checkbox list (Solutions Phase 0 §E) is built from this.
    categories: (product.categories || [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((pc) => ({ categoryId: pc.categoryId, sortOrder: pc.sortOrder, category: serializeCategoryRefAdmin(pc.category) })),
    description: product.description,
    longSpec: product.longSpec,
    material: product.material,
    gsm: product.gsm,
    moq: product.moq,
    unit: product.unit,
    dispatchEstimate: product.dispatchEstimate,
    customizable: product.customizable,
    variantType: product.variantType,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    active: product.active,
    sortOrder: product.sortOrder,
    priceMode: product.priceMode,
    fixedPrice: product.fixedPrice != null ? Number(product.fixedPrice) : null,
    quoteAboveQty: product.quoteAboveQty,
    effectivePrice: effectivePrice(product),
    priceSummary: priceSummary(product),
    priceTiers: (product.priceTiers || []).map((t) => ({
      id: t.id,
      minQty: t.minQty,
      maxQty: t.maxQty,
      unitPrice: Number(t.unitPrice),
      sortOrder: t.sortOrder,
    })),
    colors: (product.colors || []).map((pc) => ({
      id: pc.id,
      colorId: pc.colorId,
      color: serializeColorAdmin(pc.color),
      active: pc.active,
      sortOrder: pc.sortOrder,
    })),
    variants: (product.variants || []).map((v) => ({
      id: v.id,
      code: v.code,
      label: v.label,
      active: v.active,
      sortOrder: v.sortOrder,
    })),
    specifications: (product.specifications || []).map((s) => ({ id: s.id, label: s.label, value: s.value, sortOrder: s.sortOrder })),
    assets: (product.assets || []).map(serializeAssetAdmin),
    placementZones: (product.placementZones || []).map(serializePlacementZoneAdmin),
    tags: (product.tags || []).map((pt) => serializeTagAdmin(pt.tag)),
    relatedProducts: (product.relatedFrom || [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((rel) => ({ id: rel.relatedProduct.id, slug: rel.relatedProduct.slug, name: rel.relatedProduct.name, active: rel.relatedProduct.active })),
    customizationIncomplete: customizationIncomplete(product),
    createdBy: product.createdByUser ? { id: product.createdByUser.id, name: product.createdByUser.name } : null,
    updatedBy: product.updatedByUser ? { id: product.updatedByUser.id, name: product.updatedByUser.name } : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/** List row — enough for the Solutions Admin list (name, status, mapped active product count, featured, image, sort). */
function serializeSolutionAdminSummary(solution) {
  return {
    id: solution.id,
    slug: solution.slug,
    name: solution.name,
    active: solution.active,
    featuredOnHome: solution.featuredOnHome,
    sortOrder: solution.sortOrder,
    homeSortOrder: solution.homeSortOrder,
    image: solution.imageUrl ? { url: solution.imageUrl, alt: solution.imageAlt } : null,
    activeProductCount: solution.activeProductCount,
    mappedProductCount: (solution.products || []).length,
  };
}

/** Full editor shape — every field the Basics/Content/Image/Products tabs read or write. */
function serializeSolutionAdminDetail(solution) {
  const mappedProducts = (solution.products || []).map((sp) => ({
    productId: sp.productId,
    sortOrder: sp.sortOrder,
    featured: sp.featured,
    product: sp.product
      ? { id: sp.product.id, slug: sp.product.slug, name: sp.product.name, active: sp.product.active }
      : null,
  }));

  return {
    id: solution.id,
    slug: solution.slug,
    name: solution.name,
    eyebrow: solution.eyebrow,
    hubDescription: solution.hubDescription,
    heroTitle: solution.heroTitle,
    heroCopy: solution.heroCopy,
    challengeTitle: solution.challengeTitle,
    challengeCopy: solution.challengeCopy,
    challengePoints: solution.challengePoints || [],
    useCases: solution.useCases || [],
    benefits: solution.benefits || [],
    processSteps: solution.processSteps || [],
    featureSections: solution.featureSections || [],
    finalCta: solution.finalCta,
    primaryCtaLabel: solution.primaryCtaLabel,
    secondaryCtaLabel: solution.secondaryCtaLabel,
    secondaryCtaTo: solution.secondaryCtaTo,
    proofTestimonialId: solution.proofTestimonialId,
    art: solution.art,
    color: solution.color,
    active: solution.active,
    featuredOnHome: solution.featuredOnHome,
    sortOrder: solution.sortOrder,
    homeSortOrder: solution.homeSortOrder,
    // storageKey stays internal, same rule as serializeCategoryAdmin.
    image: solution.imageUrl ? { url: solution.imageUrl, alt: solution.imageAlt } : null,
    products: mappedProducts,
    activeProductCount: mappedProducts.filter((p) => p.product?.active).length,
    createdAt: solution.createdAt,
    updatedAt: solution.updatedAt,
  };
}

module.exports = {
  serializeCategoryAdmin,
  serializeColorAdmin,
  serializeTagAdmin,
  serializeProductAdminSummary,
  serializeProductAdminDetail,
  serializeAssetAdmin,
  serializePlacementZoneAdmin,
  serializeSolutionAdminSummary,
  serializeSolutionAdminDetail,
};
