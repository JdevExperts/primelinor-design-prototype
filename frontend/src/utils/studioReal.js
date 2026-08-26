/**
 * Studio real-data adapter (Phase 5 §51-55) — converts a REAL backend
 * product (raw shape, straight from GET /products/:slug — full Color
 * objects with hex, raw ProductAsset/PlacementZone rows) into the exact
 * output shape `utils/studio.js`'s legacy `resolveStudioSetup()` already
 * produces (`{status, listing, preview, assets, colors, ...}`), so
 * CustomizationStudio.jsx's existing rendering/upload/RFQ code — the vast
 * majority of that file — keeps working completely unchanged regardless
 * of which source produced the setup.
 *
 * Deliberately bypasses `api/adapters.js`'s `mapApiProductToDetailShape`
 * (used by PDP): that shape flattens `colors` down to plain slug strings
 * and drops the `colorId` needed to know which color a customization asset
 * or placement zone belongs to. Fetching the raw shape here — a small,
 * additive, Studio-only path — avoids reshaping that shared adapter (and
 * risking PDP/ProductCard/filterProducts, which already depend on its
 * current shape) just to recover fields only Studio needs.
 */
import { apiGet } from "../api/http";

export async function fetchStudioProduct(slug) {
  try {
    const { product } = await apiGet(`/products/${slug}`);
    return product;
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/**
 * Populates the Studio product switcher from real customizable products
 * (Phase 5 §53) — no hardcoded slug list. Filters on `studioReady`, not
 * the raw `customizable` flag (Phase 6A.1 §20): a product can be flagged
 * customizable before its photography/zones are configured, and the
 * switcher must not offer a product that will immediately dead-end into
 * the Unavailable screen.
 */
export async function fetchCustomizableProducts() {
  try {
    const { products } = await apiGet("/products", { params: { customizable: "true", limit: 24, sort: "recommended" } });
    return products.filter((p) => p.studioReady).map((p) => ({ id: p.slug, name: p.name, switchLabel: p.name }));
  } catch {
    return [];
  }
}

function priceTypeFromMode(priceMode) {
  if (priceMode === "FIXED") return "fixed";
  if (priceMode === "TIERED") return "tiered";
  return "quote";
}

function buildListing(product) {
  return {
    id: product.slug,
    name: product.name,
    moq: product.moq,
    unit: product.unit,
    priceType: priceTypeFromMode(product.priceMode),
    price: product.priceMode === "FIXED" ? product.fixedPrice : product.effectivePrice,
    tiers: product.priceTiers?.length
      ? product.priceTiers.map((tier) => ({ from: tier.minQty, to: tier.maxQty, price: Number(tier.unitPrice) }))
      : null,
    variantType: product.variantType,
    variants: (product.variants || []).map((v) => ({ id: v.code, label: v.label })),
    dispatchEstimate: product.dispatchEstimate,
    customizable: product.customizable,
  };
}

/**
 * Builds the `assets` shape utils/studioAssets.js's resolver functions
 * already expect — `{ byColor: { [colorSlug]: { productFront, productBack,
 * placementZones: { [placementKey]: {cx,cy,w,h} } } } }` — entirely from
 * real ProductAsset/PlacementZone rows. An asset/zone with no `colorId`
 * (applies to every color) is merged into each real color's entry as a
 * fallback that a color-specific asset/zone always overrides — never the
 * reverse, so a calibrated per-color zone is never silently replaced by a
 * generic one.
 */
export const DEFAULT_COLOR_KEY = "default";

const SIDE_BY_VIEW = { FRONT: "productFront", BACK: "productBack" };

/**
 * Builds one {src, alt, active, placementZones} photo object per side —
 * `placementZones` lives ON the photo object itself (keyed by
 * placementKey), matching the shape `utils/studioAssets.js`'s
 * `resolvePlacementZone` reads via `colorPack[side].placementZones[key]`
 * (its first, primary lookup — the shape the original mock data in
 * `data/productAssets.js` also uses). An earlier version of this function
 * attached zones as a flat sibling of `productFront`/`productBack`
 * instead, which every one of resolvePlacementZone's real-data lookups
 * missed — real photo + real zones loaded, but no logo ever appeared,
 * because the zone the overlay needed could never be found.
 */
function buildAssetsFromProduct(product) {
  const colorSlugById = new Map((product.colors || []).map((c) => [c.id, c.slug]));
  const byColor = {};
  const ANY = "__any__";

  const ensure = (key) => {
    if (!byColor[key]) byColor[key] = {};
    return byColor[key];
  };

  // The PUBLIC product API (unlike the admin one) only ever returns
  // active=true rows and doesn't even serialize an `active` field — see
  // backend services/serialize.js's serializeAsset/serializePlacementZone
  // — so there's nothing to re-check here; every row present is usable.
  for (const asset of product.assets || []) {
    const key = asset.colorId ? colorSlugById.get(asset.colorId) : ANY;
    if (!key) continue; // orphaned colorId reference — skip rather than guess
    const pack = ensure(key);
    if (asset.type === "CUSTOMIZATION_FRONT") pack.productFront = { src: asset.url, alt: asset.alt, active: true, placementZones: {} };
    if (asset.type === "CUSTOMIZATION_BACK") pack.productBack = { src: asset.url, alt: asset.alt, active: true, placementZones: {} };
  }

  // Zone geometry describes the garment, not the colourway (schema
  // comment on PlacementZone) — an ANY-scoped (colorId=null) zone is the
  // common case and applies to every colour's photo on that side; a
  // colour-specific zone overrides it for that colour only.
  const anyZonesBySide = { productFront: {}, productBack: {} };
  const ownZonesByColorSide = {};

  for (const zone of product.placementZones || []) {
    const side = SIDE_BY_VIEW[zone.view];
    if (!side) continue;
    const geometry = { cx: Number(zone.cx), cy: Number(zone.cy), w: Number(zone.width), h: Number(zone.height) };
    if (!zone.colorId) {
      anyZonesBySide[side][zone.placementKey] = geometry;
      continue;
    }
    const colorSlug = colorSlugById.get(zone.colorId);
    if (!colorSlug) continue;
    ownZonesByColorSide[colorSlug] ??= { productFront: {}, productBack: {} };
    ownZonesByColorSide[colorSlug][side][zone.placementKey] = geometry;
  }

  const attachZones = (photo, side, colorSlug) => {
    if (!photo) return null;
    return {
      ...photo,
      placementZones: {
        ...anyZonesBySide[side],
        ...(colorSlug ? ownZonesByColorSide[colorSlug]?.[side] : null),
      },
    };
  };

  const anyPack = byColor[ANY];
  delete byColor[ANY];

  const resolved = {};
  for (const color of product.colors || []) {
    const own = byColor[color.slug] || {};
    const front = own.productFront || anyPack?.productFront;
    const back = own.productBack || anyPack?.productBack;
    resolved[color.slug] = {
      productFront: attachZones(front, "productFront", color.slug),
      productBack: attachZones(back, "productBack", color.slug),
    };
  }

  // A product can be genuinely single-colorway with no ProductColor rows
  // at all (common among legacy-imported products — the backfill didn't
  // register colorways, only photography). Without this, an ANY-scoped
  // customization asset/zone would have nowhere to land: the loop above
  // only ever populates `resolved` by iterating `product.colors`.
  // DEFAULT_COLOR_KEY stands in as the product's one appearance so Studio
  // still works rather than reporting "unsupported" for a product that
  // is, in fact, fully configured.
  if (!product.colors?.length && anyPack) {
    resolved[DEFAULT_COLOR_KEY] = {
      productFront: attachZones(anyPack.productFront, "productFront", null),
      productBack: attachZones(anyPack.productBack, "productBack", null),
    };
  }

  return { byColor: resolved };
}

/**
 * Studio considers a product previewable when it's flagged customizable
 * AND has at least a front customization photo with a front placement
 * zone for SOME color (Phase 5 §52) — a back design is optional. This
 * mirrors the admin editor's own `customizationIncomplete` check, just
 * evaluated from the customer side.
 */
export function buildRealStudioSetup(product) {
  if (!product) return { status: "missing", listing: null };
  if (!product.customizable) return { status: "unsupported", listing: buildListing(product) };

  const assets = buildAssetsFromProduct(product);
  const colorsWithFront = Object.entries(assets.byColor)
    .filter(([, pack]) => pack.productFront?.src && Object.keys(pack.productFront.placementZones || {}).length)
    .map(([slug]) => slug);

  if (!colorsWithFront.length) {
    return { status: "unsupported", listing: buildListing(product) };
  }

  const colorMeta = {};
  for (const c of product.colors || []) {
    colorMeta[c.slug] = { label: c.name, hex: c.hex || "#cccccc" };
  }
  // Mirrors the DEFAULT_COLOR_KEY fallback in buildAssetsFromProduct — a
  // zero-ProductColor product previewed via its one real photo has no
  // registered name/hex, so this is a deliberately generic label rather
  // than guessing a colour from the image.
  if (colorsWithFront.includes(DEFAULT_COLOR_KEY) && !colorMeta[DEFAULT_COLOR_KEY]) {
    colorMeta[DEFAULT_COLOR_KEY] = { label: "Standard", hex: "#d8d3c8" };
  }

  const frontZoneKeys = new Set();
  const backZoneKeys = new Set();
  const placementLabels = {};
  for (const zone of product.placementZones || []) {
    (zone.view === "FRONT" ? frontZoneKeys : backZoneKeys).add(zone.placementKey);
    placementLabels[zone.placementKey] = zone.label;
  }
  const frontPlacements = [...frontZoneKeys];
  const backPlacements = [...backZoneKeys];

  return {
    status: "ok",
    listing: buildListing(product),
    preview: { name: product.name, mockup: null, zones: {} },
    assets,
    colors: colorsWithFront,
    colorMeta,
    placementLabels,
    placements: [...frontPlacements, ...backPlacements],
    frontPlacements: frontPlacements.length ? frontPlacements : ["front-center"],
    backPlacements,
    supportsBackPrint: backPlacements.length > 0,
  };
}
