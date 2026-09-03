/**
 * Bridges the real Catalog API's canonical product shape onto the shape
 * the existing frontend already expects (ProductCard, filterProducts.js,
 * utils/pricing.js, ProductDetail.jsx). This means quoteForQuantity(),
 * findTier(), filterProducts() and the PDP's JSX all keep working
 * completely unchanged on API-sourced products — only this one file needs
 * to know both shapes.
 *
 * The backend deliberately does not carry `art`/`color` illustration-
 * fallback fields (that's a frontend rendering concern, not catalog
 * domain data), size-guide measurement tables, or a "standard placements"
 * list (those are vector/illustration-system concerns, not yet backed by
 * real calibrated PlacementZone data for any seeded product) — this file
 * bridges those gaps using the same conventions already established
 * elsewhere in the frontend, rather than inventing new ones.
 */
import { apparelSizeGuide, galleryViews, hoodieSizeGuide } from "../data/productDetail";

const CATEGORY_ART_FALLBACK = {
  tshirts: "tshirt",
  polo: "polo",
  hoodies: "hoodie",
  caps: "cap",
  bags: "tote",
  bottles: "bottle",
  notebooks: "notebook",
  promotional: "pen",
  pens: "pen",
  gifts: "giftbox",
  calendars: "notebook",
  kits: "kit",
  "gift-kits": "kit",
};

/**
 * Standard placement vocabulary by illustration/mockup type — the same
 * list PLACEMENTS_BY_ART in utils/productDetail.js uses for mock products
 * with no per-product override. Kept here too (not imported) because that
 * one is a private helper, not a shared export — duplicating a small,
 * stable lookup table is simpler than reshaping that module's boundary
 * for one caller.
 */
const PLACEMENTS_BY_ART = {
  tshirt: ["left-chest", "right-chest", "front-center", "back-center", "sleeve"],
  polo: ["left-chest", "right-chest", "front-center", "back-center", "sleeve"],
  hoodie: ["left-chest", "right-chest", "front-center", "back-center", "sleeve"],
  tote: ["front-center", "back-center"],
  backpack: ["front-center"],
  cap: ["front-center"],
  bottle: ["front-center"],
  mug: ["front-center"],
  notebook: ["front-center"],
  pen: ["front-center"],
  giftbox: [],
  kit: [],
};

const DEFAULT_ART = "tshirt";
const DEFAULT_TINT = "#e3e6eb";

function artForProduct(product) {
  return CATEGORY_ART_FALLBACK[product.category?.slug] || DEFAULT_ART;
}

function tintForProduct(product) {
  return product.colors?.[0]?.hex || DEFAULT_TINT;
}

function priceTypeFromMode(priceMode) {
  if (priceMode === "FIXED") return "fixed";
  if (priceMode === "TIERED") return "tiered";
  return "quote";
}

function specFromProduct(product) {
  const parts = [];
  if (product.gsm) parts.push(`${product.gsm} GSM`);
  if (product.material) parts.push(capitalize(product.material));
  return parts.join(" • ");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function priceNoteFromTiers(product) {
  if (product.priceMode !== "TIERED" || !product.priceTiers?.length) return null;
  const entry = product.priceTiers.reduce((lowest, tier) =>
    tier.minQty < lowest.minQty ? tier : lowest,
  );
  const range = entry.maxQty == null ? `${entry.minQty}+` : `${entry.minQty}–${entry.maxQty}`;
  return `for ${range} ${pluralUnit(product.unit)}`;
}

function pluralUnit(unit) {
  if (unit === "piece") return "pieces";
  return unit.endsWith("s") ? unit : `${unit}s`;
}

function sizeGuideFor(product) {
  if (product.variantType !== "size") return null;
  return product.category?.slug === "hoodies" ? hoodieSizeGuide : apparelSizeGuide;
}

/**
 * PDP/Studio asset unification: PDP's gallery is now built from the same
 * canonical ProductAsset TYPE taxonomy Studio already uses, instead of the
 * old disconnected `galleryViews` template with `image` always null. No
 * `front` entry here — that slot uses `product.primaryImage` directly
 * (see `galleryFor` below) so it can never drift from the card/listing
 * image.
 */
const ASSET_TYPES_BY_GALLERY_VIEW = {
  back: ["GALLERY_BACK"],
  detail: ["DETAIL"],
  lifestyle: ["LIFESTYLE", "MODEL", "TEAM"],
};

function assetUrlForGalleryView(assets, viewId) {
  const preferredTypes = ASSET_TYPES_BY_GALLERY_VIEW[viewId] || [];
  for (const type of preferredTypes) {
    const match = assets.find((asset) => asset.type === type);
    if (match) return match.url;
  }
  return null;
}

/**
 * The "front" gallery slot — PDP's default, initially-visible image
 * (ProductDetail.jsx opens with `view: "front"`) — must be the exact same
 * image as every card surface (Phase 6A.1 follow-up: image consistency).
 * It reuses `product.primaryImage` (computed once, backend-side, by
 * services/productImageSelection.js — the same field `image` on the
 * listing shape already uses) instead of independently re-deriving a
 * "front" pick via `ASSET_TYPES_BY_GALLERY_VIEW`, whose CATALOG/
 * GALLERY_FRONT priority had drifted from the canonical rule (GALLERY_FRONT
 * preferred over CATALOG here, the reverse of primaryImage's CATALOG-first
 * rule) — the exact cause of a product's card and PDP showing two
 * different photos. Every other view (back/detail/lifestyle) is a
 * genuinely separate concern from "the" primary image and keeps its own
 * per-type resolution.
 */
function galleryFor(product) {
  const assets = product.assets || [];
  return galleryViews.map((view) => ({
    ...view,
    image: view.id === "front" ? product.primaryImage?.url || null : assetUrlForGalleryView(assets, view.id),
  }));
}

/** Catalog card / listing shape — matches catalogData.js's product records. */
export function mapApiProductToListingShape(product) {
  return {
    id: product.slug,
    name: product.name,
    // Permanent human-friendly base-product identifier (PL-[TYPE]-[NNN]).
    // Shown on cards/PDP and matched by catalogue search.
    productCode: product.productCode || null,
    spec: specFromProduct(product),
    art: artForProduct(product),
    color: tintForProduct(product),
    // The backend computes this with the same CATALOG→GALLERY_FRONT→
    // first-active priority everywhere (services/productImageSelection.js)
    // — every card using this shape (Homepage, Listing, Related Products,
    // Corporate Gifting) gets a real photo the moment one exists, with no
    // per-surface image logic here (Phase 6A.1 §2/§4).
    image: product.primaryImage?.url || null,
    imageAlt: product.primaryImage?.alt || null,
    priceType: priceTypeFromMode(product.priceMode),
    price: product.effectivePrice,
    priceNote: priceNoteFromTiers(product),
    moq: product.moq,
    unit: product.unit,
    tiers: product.priceTiers?.length
      ? product.priceTiers.map((tier) => ({
          from: tier.minQty,
          to: tier.maxQty,
          price: Number(tier.unitPrice),
        }))
      : null,
    // `category` stays the PRIMARY slug (breadcrumb/canonical identity,
    // Solutions Phase 0 §I — never changes meaning). `categories` is the
    // product's full ProductCategory membership set (primary + secondary)
    // — filterProducts.js matches against this so a category filter finds
    // a product through ANY of its mapped categories, not only the primary
    // (Category Merchandising Audit §13: the whole reason a customer
    // filtering by "Promotional Products" should see a cross-listed cap or
    // pen, not just the two products that happen to primary there).
    category: product.category?.slug,
    // Kept as {slug, sortOrder} pairs (not bare strings) so the frontend
    // can also honor ProductCategory.sortOrder for merchandising order
    // when a single category filter is active (Category Merchandising
    // Audit §5/§6) — sortOrder here isn't provided by the public API today
    // (serializeProductCategories intentionally drops it, same privacy
    // reasoning as not exposing internal join-row ids), so this always
    // reads as 0 until/unless that's added; filtering by membership still
    // works correctly regardless.
    categories: (product.categories || []).map((c) => ({ slug: c.slug, sortOrder: c.sortOrder ?? 0 })),
    material: product.material,
    gsm: product.gsm,
    colors: (product.colors || []).map((c) => c.slug),
    useCases: product.tags || [],
    customizable: product.customizable,
    // Whether Try Your Logo will actually work for this product, not just
    // whether it's flagged for eventual configuration (Phase 6A.1 §18/§19
    // — see backend services/studioReadiness.js, the single source of
    // truth this mirrors). Every CTA that offers Try Your Logo — PDP,
    // ProductCard, related products — must gate on this, not `customizable`.
    studioReady: Boolean(product.studioReady),
    active: product.active !== false,
    recommended: product.sortOrder,
    added: new Date(product.createdAt).getTime(),
  };
}

/** Full PDP shape — matches what utils/productDetail.js's getProductDetail() returns. */
export function mapApiProductToDetailShape(product) {
  const base = mapApiProductToListingShape(product);

  return {
    ...base,
    categoryLabel: product.category?.name || "Products",
    description: product.description,
    longSpec: product.longSpec || base.spec,
    seoTitle: product.seoTitle || null,
    seoDescription: product.seoDescription || null,
    variantType: product.variantType,
    variants: (product.variants || []).map((v) => ({ id: v.code, label: v.label })),
    sizeGuide: sizeGuideFor(product),
    placements: PLACEMENTS_BY_ART[base.art] || [],
    dispatchEstimate: product.dispatchEstimate,
    highlights: (product.specifications || []).map((s) => s.value),
    specifications: product.specifications || [],
    relatedProductIds: (product.relatedProducts || []).map((r) => r.slug),
    relatedProducts: (product.relatedProducts || []).map(mapApiProductToListingShape),
    gallery: galleryFor(product),
    fit: null,
    gender: null,
    sleeve: null,
    neck: null,
    assets: product.assets || [],
    placementZones: product.placementZones || [],
  };
}

/**
 * Bridges the backend's Solution shape onto the view-shape every existing
 * SolutionCard/SolutionHero/SolutionChallenge/SolutionBenefits/
 * SolutionProcess/SolutionFeature/SolutionFinalCta/SolutionProof component
 * already expects (Solutions Phase A/D) — the exact record shape
 * frontend/src/data/solutionsData.js used to provide, so none of those
 * presentational components needed to change. Works for both the list
 * shape (no `products`) and the full detail shape.
 */
export function mapApiSolutionToViewShape(solution) {
  return {
    slug: solution.slug,
    label: solution.name,
    eyebrow: solution.eyebrow,
    art: solution.art,
    color: solution.color,
    hubDescription: solution.hubDescription,
    categoryHints: (solution.categories || []).map((c) => c.name),
    heroTitle: solution.heroTitle,
    heroCopy: solution.heroCopy,
    heroImage: solution.image?.url || null,
    heroAlt: solution.image?.alt || `${solution.name} — photography placeholder`,
    challengeTitle: solution.challengeTitle,
    challengeCopy: solution.challengeCopy,
    challengePoints: solution.challengePoints || [],
    useCases: solution.useCases || [],
    recommendedCategories: (solution.categories || []).map((c) => ({ id: c.slug, label: c.name })),
    benefits: solution.benefits || [],
    processSteps: solution.processSteps || [],
    featureSections: solution.featureSections || [],
    finalCta: solution.finalCta,
    proofTestimonialId: solution.proofTestimonialId,
    primaryCtaLabel: solution.primaryCtaLabel,
    secondaryCtaLabel: solution.secondaryCtaLabel,
    secondaryCtaTo: solution.secondaryCtaTo,
    // Only present on the detail response — already resolved server-side
    // (no per-product N+1 fetch, Solutions Phase A §19), mapped through the
    // same listing-shape adapter every other product card uses.
    products: solution.products ? solution.products.map(mapApiProductToListingShape) : undefined,
  };
}
