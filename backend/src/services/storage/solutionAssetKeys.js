const crypto = require("node:crypto");
const path = require("node:path");
const { sanitizeFileName } = require("./keys");

/**
 * Solution hero images get their own namespace, `solutions/<solution-id>/...`
 * — same convention as categoryAssetKeys.js/productAssetKeys.js, kept as a
 * distinct prefix so Solution/Category/Product image lifecycles never
 * collide even though they share the same underlying storage implementation.
 */
function generateSolutionAssetKey(solutionId, originalFileName) {
  const ext = path.extname(originalFileName || "").toLowerCase();
  const base = sanitizeFileName(path.basename(originalFileName || "file", ext)) || "file";
  const unique = crypto.randomUUID();
  return `solutions/${solutionId}/${unique}-${base}${ext}`;
}

module.exports = { generateSolutionAssetKey };
