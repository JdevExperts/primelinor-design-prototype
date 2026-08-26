/**
 * Pure selection/classification helpers for scripts/promoteProductAssetsToS3.js
 * — kept dependency-free (no DB, no fs, no S3 client) so the "is this asset
 * safe to touch" logic is unit testable in isolation from the actual run.
 */

// The 20 products whose local-disk CATALOG asset this task promotes to S3.
// An explicit allowlist, not "type=CATALOG" alone — legacy-imported
// products also have CATALOG assets, and those must never be touched here.
const EXPECTED_PROMOTION_SLUGS = new Set([
  "a5-notebook-diary",
  "conference-kit",
  "executive-gift-set",
  "executive-notebook",
  "festival-gift-box",
  "metal-pen",
  "plastic-promotional-pen",
  "classic-cap",
  "cotton-tote-bag",
  "drawstring-bag",
  "laptop-backpack",
  "premium-cap",
  "pullover-hoodie",
  "zipper-hoodie",
  "ceramic-mug",
  "sipper-tumbler",
  "vacuum-insulated-bottle",
  "corporate-staff-uniform-tshirt",
  "event-essentials-kit",
  "promotional-merchandise-kit",
]);

// Studio ("Try Your Logo") products — never touched by this task, even
// defensively, even if a future CATALOG asset somehow existed for one.
const STUDIO_EXCLUDED_SLUGS = new Set([
  "cotton-round-neck",
  "premium-polo",
  "corporate-bottle",
  "canvas-tote",
  "welcome-kit",
  "biowash-round-neck-t-shirt",
]);

/** True only for a URL that looks like this app's own local-disk product-asset server. */
function isLocalDiskUrl(url) {
  if (!url) return false;
  return url.includes("localhost") || url.includes("/product-assets/");
}

/** True for a storageKey using this app's own managed `products/<id>/...` convention (never a legacy/external key). */
function isManagedStorageKey(storageKey) {
  return Boolean(storageKey) && storageKey.startsWith("products/");
}

/**
 * Classifies one ProductAsset row for the promotion run. Never returns
 * PROMOTE for a legacy/external asset, a Studio-excluded product, or a
 * product outside the expected 20 — those are structural safeguards, not
 * just a WHERE clause, per Phase 6A.2 §13.
 */
function classifyAsset({ productSlug, asset }) {
  if (STUDIO_EXCLUDED_SLUGS.has(productSlug)) {
    return { action: "EXCLUDED_STUDIO_PRODUCT", reason: `${productSlug} is a Studio/Try-Your-Logo product — never touched by this task` };
  }
  if (!EXPECTED_PROMOTION_SLUGS.has(productSlug)) {
    return { action: "EXCLUDED_NOT_IN_SCOPE", reason: `${productSlug} is not one of the 20 expected AI-catalogue-image products` };
  }
  if (asset.type !== "CATALOG") {
    return { action: "EXCLUDED_WRONG_TYPE", reason: `asset type is ${asset.type}, not CATALOG` };
  }
  if (!isLocalDiskUrl(asset.url)) {
    return { action: "SKIP_ALREADY_S3", reason: "URL does not look like local-disk storage — already promoted, or not a local asset to begin with" };
  }
  if (!isManagedStorageKey(asset.storageKey)) {
    return { action: "SKIP_NOT_MANAGED", reason: "asset has no managed storageKey (URL-only external reference) — refusing to touch" };
  }
  return { action: "PROMOTE", reason: "active CATALOG asset, local-disk URL, managed storageKey, product in expected scope" };
}

module.exports = { EXPECTED_PROMOTION_SLUGS, STUDIO_EXCLUDED_SLUGS, isLocalDiskUrl, isManagedStorageKey, classifyAsset };
