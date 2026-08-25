const crypto = require("node:crypto");
const path = require("node:path");
const { sanitizeFileName } = require("./keys");

/**
 * Product images live in their own namespace, `products/<product-id>/...`
 * (Phase 5 §28) — deliberately distinct from `artwork/...` (customer
 * uploads, private, swept by a TTL cleanup job) so the two lifecycles never
 * collide, and so this new system's uploads never risk touching an
 * existing production S3 key convention (Phase 5 §75).
 */
function generateProductAssetKey(productId, originalFileName) {
  const ext = path.extname(originalFileName || "").toLowerCase();
  const base = sanitizeFileName(path.basename(originalFileName || "file", ext)) || "file";
  const unique = crypto.randomUUID();
  return `products/${productId}/${unique}-${base}${ext}`;
}

module.exports = { generateProductAssetKey };
