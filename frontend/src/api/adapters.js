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
  "corporate-gifts": "giftbox",
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
 * seeded product has real assets yet, so every view still falls back to
 * the vector illustration today — but the thumbnail row is wired to real
 * data the moment ProductAsset rows exist, with no further PDP changes.
 */
const ASSET_TYPES_BY_GALLERY_VIEW = {
  front: ["GALLERY_FRONT", "CATALOG"],
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

function galleryFor(product) {
  const assets = product.assets || [];
  return galleryViews.map((view) => ({
    ...view,
    image: assetUrlForGalleryView(assets, view.id),
  }));
}

/** Catalog card / listing shape — matches catalogData.js's product records. */
export function mapApiProductToListingShape(product) {
  return {
    id: product.slug,
    name: product.name,
    spec: specFromProduct(product),
    art: artForProduct(product),
    color: tintForProduct(product),
    image: null,
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
    category: product.category?.slug,
    material: product.material,
    gsm: product.gsm,
    colors: (product.colors || []).map((c) => c.slug),
    useCases: product.tags || [],
    customizable: product.customizable,
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
