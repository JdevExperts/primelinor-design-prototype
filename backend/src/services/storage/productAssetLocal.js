/**
 * Dev-only local disk fallback for product images — separate root from
 * artwork's `storage/artwork/` (private, TTL-swept) since product images
 * are permanent public catalogue content with a different lifecycle.
 * Served directly by `express.static` (server.js) at `/product-assets/*`,
 * no signing needed since these are meant to be public.
 */
const fs = require("node:fs/promises");
const path = require("node:path");

const STORAGE_ROOT = path.join(__dirname, "../../../storage/products");
const PUBLIC_BASE = process.env.BACKEND_PUBLIC_URL || "http://localhost:4001";

function resolvePath(key) {
  const resolved = path.resolve(STORAGE_ROOT, key);
  if (!resolved.startsWith(STORAGE_ROOT)) {
    throw new Error("Invalid storage key");
  }
  return resolved;
}

async function putObject({ buffer, key }) {
  const filePath = resolvePath(key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
  return key;
}

function buildPublicUrl(key) {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${PUBLIC_BASE}/product-assets/${encodedKey}`;
}

async function deleteObject(key) {
  try {
    await fs.unlink(resolvePath(key));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

module.exports = { putObject, buildPublicUrl, deleteObject, STORAGE_ROOT };
