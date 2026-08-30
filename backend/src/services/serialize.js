const { effectivePrice } = require("./pricing");
const { selectPrimaryImage } = require("./productImageSelection");
const { isStudioReady } = require("./studioReadiness");

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

/**
 * Distinct categories a product belongs to (all ProductCategory
 * memberships), ordered by membership sortOrder, active memberships only —
 * never surfaces an inactive category to a customer (Solutions Phase 0 §G).
 */
function serializeProductCategories(productCategories) {
  return (productCategories || [])
    .filter((pc) => pc.category?.active)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((pc) => ({
      ...serializeCategoryRef(pc.category),
      // This product's merchandising rank WITHIN this specific category's
      // listing (Category Merchandising Audit §5/§6) — not sensitive
      // (unlike imageStorageKey/internal ids), and the frontend category
      // filter needs it to reproduce ProductCategory.sortOrder client-side
      // the same way GET /products?category=X already does server-side.
      sortOrder: pc.sortOrder,
    }));
}

/** List/card shape — no internal-only fields, no heavy relations. */
function serializeProductSummary(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    primaryCategory: serializeCategoryRef(product.primaryCategory),
    categories: serializeProductCategories(product.categories),
    // Temporary back-compat alias (Solutions Phase 0 §G) — every existing
    // consumer (frontend adapters.js, etc.) reads `product.category`.
    // Remove once all frontend consumers read `primaryCategory` directly.
    category: serializeCategoryRef(product.primaryCategory),
    material: product.material,
    gsm: product.gsm,
    moq: product.moq,
    unit: product.unit,
    priceMode: product.priceMode,
    fixedPrice: product.fixedPrice != null ? Number(product.fixedPrice) : null,
    effectivePrice: effectivePrice(product),
    priceTiers: (product.priceTiers || []).map(serializeTier),
    // Derived, not the raw asset collection (Phase 6A.1 §31) — full
    // assets stay a detail-only concern (see serializeProductDetail).
    primaryImage: selectPrimaryImage(product.assets),
    // TIERED only — quantities at/above this are outside priced coverage and
    // become quote-required (Phase 5 §23/§24). Null for every other mode.
    quoteAboveQty: product.quoteAboveQty ?? null,
    customizable: product.customizable,
    // Whether Studio will actually work for this product right now, not
    // just whether it's flagged for eventual configuration (Phase 6A.1
    // §7/§18/§20) — see services/studioReadiness.js.
    studioReady: isStudioReady(product),
    colors: (product.colors || []).map(serializeColorRef),
    sortOrder: product.sortOrder,
    createdAt: product.createdAt,
  };
}

/**
 * Full PDP/Studio shape. `relatedProducts` is resolved by the caller
 * (products.controller.js's resolveRelatedProducts — curated ProductRelated
 * rows topped up with same-category fallback, PDP Content Cleanup) rather
 * than derived here from the raw `relatedFrom` join, since picking the
 * fallback pool needs sibling Prisma queries this serializer doesn't run.
 */
function serializeProductDetail(product, relatedProducts = []) {
  return {
    ...serializeProductSummary(product),
    description: product.description,
    longSpec: product.longSpec,
    // Admin-set SEO overrides (Phase 6B §31) — null unless staff filled
    // them in; the frontend falls back to name/description when absent.
    seoTitle: product.seoTitle || null,
    seoDescription: product.seoDescription || null,
    variantType: product.variantType,
    variants: (product.variants || []).map(serializeVariant),
    specifications: (product.specifications || []).map(serializeSpecification),
    dispatchEstimate: product.dispatchEstimate,
    assets: (product.assets || []).map(serializeAsset),
    placementZones: (product.placementZones || []).map(serializePlacementZone),
    tags: (product.tags || []).map((productTag) => productTag.tag.slug),
    relatedProducts: relatedProducts.map(serializeProductSummary),
  };
}

/** Customer-safe image shape — never `imageStorageKey` (deletion-ownership bookkeeping only). */
function serializeCategoryImage(category) {
  return category.imageUrl ? { url: category.imageUrl, alt: category.imageAlt } : null;
}

function serializeCategory(category) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    sortOrder: category.sortOrder,
    image: serializeCategoryImage(category),
    children: (category.children || [])
      .filter((child) => child.active)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((child) => ({
        id: child.id,
        slug: child.slug,
        name: child.name,
        sortOrder: child.sortOrder,
        image: serializeCategoryImage(child),
      })),
  };
}

/** Customer-safe image shape — never `imageStorageKey`, same rule as serializeCategoryImage. */
function serializeSolutionImage(solution) {
  return solution.imageUrl ? { url: solution.imageUrl, alt: solution.imageAlt } : null;
}

/**
 * Distinct categories of a Solution's ACTIVE mapped products, in
 * first-occurrence order by SolutionProduct.sortOrder (Solutions Phase A
 * §12/§20 — no SolutionCategory table; derived instead).
 *
 * Decision (Solutions Phase 0 §J): uses each product's PRIMARY category
 * only, not its full ProductCategory membership set. Now that a product can
 * carry several secondary categories (merchandising/discovery relationships
 * per §I, not canonical), deriving from every membership risks flooding a
 * Solution's category-chip row with categories only loosely related to that
 * use case. The primary category is the one canonical "what this product
 * is" — the right granularity for a small "Explore by category" chip list.
 * Revisit only if V1 usage shows primary-only is too sparse in practice.
 *
 * Pure — exported for unit testing without a database. Caller must pass
 * `solutionProducts` already ordered by sortOrder and must include each
 * product's primaryCategory.
 */
function deriveSolutionCategories(solutionProducts) {
  const seen = new Set();
  const categories = [];
  for (const sp of solutionProducts || []) {
    const product = sp.product;
    const category = product?.primaryCategory;
    if (!product?.active || !category?.active || seen.has(category.id)) continue;
    seen.add(category.id);
    categories.push({ id: category.id, slug: category.slug, name: category.name });
  }
  return categories;
}

/** List/card shape — enough for the homepage and /solutions hub. */
function serializeSolutionSummary(solution) {
  return {
    id: solution.id,
    slug: solution.slug,
    name: solution.name,
    eyebrow: solution.eyebrow,
    hubDescription: solution.hubDescription,
    art: solution.art,
    color: solution.color,
    image: serializeSolutionImage(solution),
    featuredOnHome: solution.featuredOnHome,
    sortOrder: solution.sortOrder,
    homeSortOrder: solution.homeSortOrder,
    categories: deriveSolutionCategories(solution.products),
  };
}

/** Full detail shape — everything SolutionDetail's template components need. */
function serializeSolutionDetail(solution) {
  return {
    ...serializeSolutionSummary(solution),
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
    // Inactive mapped products are never shipped publicly (Solutions Phase
    // A §6/§21) — filtered here rather than trusting the caller's query
    // already did so, same defensive posture as selectPrimaryImage.
    products: (solution.products || [])
      .filter((sp) => sp.product?.active)
      .map((sp) => serializeProductSummary(sp.product)),
  };
}

module.exports = {
  serializeProductSummary,
  serializeProductDetail,
  serializeCategory,
  serializeSolutionSummary,
  serializeSolutionDetail,
  deriveSolutionCategories,
};
