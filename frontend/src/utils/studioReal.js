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

/** Populates the Studio product switcher from real customizable products (Phase 5 §53) — no hardcoded slug list. */
export async function fetchCustomizableProducts() {
  try {
    const { products } = await apiGet("/products", { params: { customizable: "true", limit: 24, sort: "recommended" } });
    return products.map((p) => ({ id: p.slug, name: p.name, switchLabel: p.name }));
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
function buildAssetsFromProduct(product) {
  const colorSlugById = new Map((product.colors || []).map((c) => [c.id, c.slug]));
  const byColor = {};
  const ANY = "__any__";

  const ensure = (key) => {
    if (!byColor[key]) byColor[key] = { placementZones: {} };
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
    if (asset.type === "CUSTOMIZATION_FRONT") pack.productFront = { src: asset.url, alt: asset.alt, active: true };
    if (asset.type === "CUSTOMIZATION_BACK") pack.productBack = { src: asset.url, alt: asset.alt, active: true };
  }

  for (const zone of product.placementZones || []) {
    const key = zone.colorId ? colorSlugById.get(zone.colorId) : ANY;
    if (!key) continue;
    const pack = ensure(key);
    pack.placementZones[zone.placementKey] = {
      cx: Number(zone.cx),
      cy: Number(zone.cy),
      w: Number(zone.width),
      h: Number(zone.height),
    };
  }

  const anyPack = byColor[ANY];
  delete byColor[ANY];

  const resolved = {};
  for (const color of product.colors || []) {
    const own = byColor[color.slug] || {};
    resolved[color.slug] = {
      productFront: own.productFront || anyPack?.productFront || null,
      productBack: own.productBack || anyPack?.productBack || null,
      placementZones: { ...(anyPack?.placementZones || {}), ...(own.placementZones || {}) },
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
    .filter(([, pack]) => pack.productFront?.src && Object.keys(pack.placementZones).length)
    .map(([slug]) => slug);

  if (!colorsWithFront.length) {
    return { status: "unsupported", listing: buildListing(product) };
  }

  const colorMeta = {};
  for (const c of product.colors || []) {
    colorMeta[c.slug] = { label: c.name, hex: c.hex || "#cccccc" };
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
