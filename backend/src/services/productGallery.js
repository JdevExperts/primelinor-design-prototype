/**
 * Customer-facing PDP image gallery (PDP Image Gallery Fix).
 *
 * The public product-detail API always shipped the full `assets` array, but
 * the frontend only ever rendered a fixed four-slot template
 * (front / back / detail / lifestyle), each slot resolving to at most one
 * asset by type. A product with several CATALOG / GALLERY_FRONT /
 * CUSTOMIZATION_FRONT photos therefore collapsed to a single "front" image
 * on the PDP, and the other three slots rendered empty placeholder
 * thumbnails.
 *
 * This module is the ONE rule for which assets a normal customer should see
 * in the PDP gallery, in what order, de-duplicated — computed server-side
 * (exposed as `product.images`) so the client never reconstructs it from a
 * partial asset list.
 *
 * It deliberately does NOT touch the raw `assets` array (Studio, placement
 * zones and `supportsArtworkOverlay` still read that) and never deletes or
 * mutates any ProductAsset row — this is display/API shaping only.
 */

// Customer-appropriate asset roles, in display order:
//   1. CATALOG          — the canonical "main" product photo
//   2. GALLERY_FRONT    — studio-quality front shots
//   3. GALLERY_BACK     — studio-quality back shots
//   4. DETAIL           — close-up / fabric / trim detail
//   5. LIFESTYLE / MODEL / TEAM — context & branding-example imagery
//   6. CUSTOMIZATION_FRONT / CUSTOMIZATION_BACK — exist mainly for Try Your
//      Logo / Studio, but a blank-garment mockup is still a real product
//      photo, so it is included when it is NOT a duplicate of an image
//      already in the gallery (see de-dup below).
// Any AssetType not listed here (or added to the enum later) is treated as
// non-customer-facing and excluded rather than leaked.
const GALLERY_TYPE_ORDER = [
  "CATALOG",
  "GALLERY_FRONT",
  "GALLERY_BACK",
  "DETAIL",
  "LIFESTYLE",
  "MODEL",
  "TEAM",
  "CUSTOMIZATION_FRONT",
  "CUSTOMIZATION_BACK",
];

const GALLERY_TYPE_RANK = Object.fromEntries(GALLERY_TYPE_ORDER.map((type, index) => [type, index]));

/**
 * True when `asset` is an active, customer-appropriate product image.
 * Excludes inactive assets, assets with no URL, and any asset whose type is
 * not part of the customer-gallery taxonomy.
 */
function isCustomerGalleryAsset(asset) {
  if (!asset || asset.active === false) return false;
  if (!asset.url || !String(asset.url).trim()) return false;
  return Object.prototype.hasOwnProperty.call(GALLERY_TYPE_RANK, asset.type);
}

/**
 * Stable visual identity for de-duplication: the storage key when present,
 * otherwise the URL. Two asset rows that point at the same underlying file
 * (e.g. a CUSTOMIZATION_FRONT that reuses a GALLERY_FRONT photo) collapse to
 * one gallery entry.
 */
function assetVisualKey(asset) {
  const key = asset.storageKey && String(asset.storageKey).trim();
  return key || asset.url;
}

/**
 * Ordered, de-duplicated customer gallery for a product's assets.
 *
 * Order: customer-gallery type rank → the asset's own `sortOrder` →
 * `id` (deterministic final tie-break).
 * De-dup: the first asset seen for a given storage key / URL wins.
 *
 * @param {Array} assets  raw ProductAsset rows (may include `storageKey`)
 * @returns {{ id: string, url: string, alt: string|null, sortOrder: number }[]}
 */
function buildCustomerGallery(assets) {
  const eligible = (assets || [])
    .filter(isCustomerGalleryAsset)
    .slice()
    .sort((a, b) => {
      const byType = GALLERY_TYPE_RANK[a.type] - GALLERY_TYPE_RANK[b.type];
      if (byType !== 0) return byType;
      const bySort = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (bySort !== 0) return bySort;
      return String(a.id).localeCompare(String(b.id));
    });

  const seen = new Set();
  const images = [];
  for (const asset of eligible) {
    const key = assetVisualKey(asset);
    if (seen.has(key)) continue;
    seen.add(key);
    images.push({
      id: asset.id,
      url: asset.url,
      alt: asset.alt ?? null,
      sortOrder: asset.sortOrder ?? 0,
    });
  }
  return images;
}

module.exports = {
  GALLERY_TYPE_ORDER,
  isCustomerGalleryAsset,
  assetVisualKey,
  buildCustomerGallery,
};
