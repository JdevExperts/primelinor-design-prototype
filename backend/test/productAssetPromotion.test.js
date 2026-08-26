const test = require("node:test");
const assert = require("node:assert/strict");
const { classifyAsset, isLocalDiskUrl, isManagedStorageKey } = require("../scripts/lib/productAssetPromotion");

test("classifyAsset: promotes a local-disk CATALOG asset belonging to an expected product", () => {
  const result = classifyAsset({
    productSlug: "ceramic-mug",
    asset: { type: "CATALOG", url: "http://localhost:4001/product-assets/products/abc/x-ceramic-mug-catalog-01.png", storageKey: "products/abc/x-ceramic-mug-catalog-01.png" },
  });
  assert.equal(result.action, "PROMOTE");
});

test("classifyAsset: excludes a Studio product even if it somehow had a CATALOG asset", () => {
  const result = classifyAsset({
    productSlug: "canvas-tote",
    asset: { type: "CATALOG", url: "http://localhost:4001/product-assets/products/abc/x.png", storageKey: "products/abc/x.png" },
  });
  assert.equal(result.action, "EXCLUDED_STUDIO_PRODUCT");
});

test("classifyAsset: excludes a product outside the expected 20-slug scope", () => {
  const result = classifyAsset({
    productSlug: "dry-fit-round-neck-t-shirt",
    asset: { type: "CATALOG", url: "http://localhost:4001/product-assets/products/abc/x.png", storageKey: "products/abc/x.png" },
  });
  assert.equal(result.action, "EXCLUDED_NOT_IN_SCOPE");
});

test("classifyAsset: never promotes a legacy external S3 URL, even for an in-scope slug", () => {
  const result = classifyAsset({
    productSlug: "ceramic-mug",
    asset: { type: "CATALOG", url: "https://pl-bulk.s3.ap-south-1.amazonaws.com/images/products/xyz/legacy.png", storageKey: null },
  });
  assert.equal(result.action, "SKIP_ALREADY_S3");
});

test("classifyAsset: skips an already-S3 URL (idempotent rerun)", () => {
  const result = classifyAsset({
    productSlug: "ceramic-mug",
    asset: { type: "CATALOG", url: "https://pl-bulk.s3.ap-south-1.amazonaws.com/products/abc/x-ceramic-mug-catalog-01.png", storageKey: "products/abc/x-ceramic-mug-catalog-01.png" },
  });
  assert.equal(result.action, "SKIP_ALREADY_S3");
});

test("classifyAsset: refuses a URL-only (no managed storageKey) local-looking asset", () => {
  const result = classifyAsset({
    productSlug: "ceramic-mug",
    asset: { type: "CATALOG", url: "http://localhost:4001/product-assets/some/external/path.png", storageKey: null },
  });
  assert.equal(result.action, "SKIP_NOT_MANAGED");
});

test("classifyAsset: excludes a non-CATALOG asset type", () => {
  const result = classifyAsset({
    productSlug: "ceramic-mug",
    asset: { type: "GALLERY_FRONT", url: "http://localhost:4001/product-assets/products/abc/x.png", storageKey: "products/abc/x.png" },
  });
  assert.equal(result.action, "EXCLUDED_WRONG_TYPE");
});

test("isLocalDiskUrl / isManagedStorageKey: basic sanity", () => {
  assert.equal(isLocalDiskUrl("http://localhost:4001/product-assets/x.png"), true);
  assert.equal(isLocalDiskUrl("https://pl-bulk.s3.ap-south-1.amazonaws.com/images/x.png"), false);
  assert.equal(isManagedStorageKey("products/abc/x.png"), true);
  assert.equal(isManagedStorageKey(null), false);
  assert.equal(isManagedStorageKey("images/products/legacy.png"), false);
});
