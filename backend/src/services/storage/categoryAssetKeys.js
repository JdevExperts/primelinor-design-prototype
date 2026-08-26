const crypto = require("node:crypto");
const path = require("node:path");
const { sanitizeFileName } = require("./keys");

/**
 * Category images get their own namespace, `categories/<category-id>/...`
 * — same convention as ProductAsset's `products/<product-id>/...`
 * (productAssetKeys.js), kept as a distinct prefix so category and
 * product image lifecycles never collide even though they share the same
 * underlying S3 bucket and public/local storage implementations.
 */
function generateCategoryAssetKey(categoryId, originalFileName) {
  const ext = path.extname(originalFileName || "").toLowerCase();
  const base = sanitizeFileName(path.basename(originalFileName || "file", ext)) || "file";
  const unique = crypto.randomUUID();
  return `categories/${categoryId}/${unique}-${base}${ext}`;
}

module.exports = { generateCategoryAssetKey };
