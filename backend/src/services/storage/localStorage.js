/**
 * Dev-only storage fallback. This sandbox has no real AWS credentials, and
 * artwork uploads need to be end-to-end testable, so local disk stands in
 * for S3 — same pattern already used for Postgres instead of a managed
 * cloud DB in Phase 1. Implements the exact same contract as
 * s3Storage.js (putObject/getSignedReadUrl/deleteObject) so
 * src/services/storage/index.js can swap between them with zero caller
 * changes, and so switching to real S3 in production requires only setting
 * AWS_S3_BUCKET + credentials — no code change.
 *
 * "Signed URL" here means an HMAC-SHA256 signature over the key + expiry,
 * verified by the GET /api/v1/artwork-preview/:key route
 * (src/routes/artworkPreview.routes.js) — expired or tampered links 403.
 */
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const STORAGE_ROOT = path.join(__dirname, "../../../storage/artwork");
const SECRET = process.env.ARTWORK_URL_SECRET || "dev-only-insecure-artwork-secret";
const PUBLIC_BASE = process.env.BACKEND_PUBLIC_URL || "http://localhost:4001";

function sign(key, expires) {
  return crypto.createHmac("sha256", SECRET).update(`${key}:${expires}`).digest("hex");
}

function verifySignature(key, expires, signature) {
  if (!key || !expires || !signature) return false;
  if (Date.now() > Number(expires)) return false;
  const expected = sign(key, expires);
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

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

async function getObjectBuffer(key) {
  return fs.readFile(resolvePath(key));
}

// `filename` isn't threaded into the URL itself — the preview controller
// looks the asset (and its original filename) up from the DB directly and
// applies Content-Disposition: attachment there. Accepted here only so
// callers share one call signature with s3Storage's getSignedReadUrl.
async function getSignedReadUrl(key, { expiresInSeconds = 900 } = {}) {
  const expires = Date.now() + expiresInSeconds * 1000;
  const signature = sign(key, expires);
  return `${PUBLIC_BASE}/api/v1/artwork-preview/${encodeURIComponent(key)}?expires=${expires}&sig=${signature}`;
}

async function deleteObject(key) {
  try {
    await fs.unlink(resolvePath(key));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

module.exports = { putObject, getObjectBuffer, getSignedReadUrl, deleteObject, verifySignature };
