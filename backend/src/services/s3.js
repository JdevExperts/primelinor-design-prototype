/**
 * Minimal S3 URL/key helpers — reference only, no upload capability.
 *
 * Phase 1 does not upload anything. This exists solely so ProductAsset rows
 * can point at existing production S3 objects (which must not be moved,
 * renamed, or re-uploaded) without the schema forcing every asset to also
 * carry a fresh `storageKey`. See ProductAsset in schema.prisma.
 *
 * Real upload handling (multer + PutObjectCommand, following the old
 * backend's reasonable pattern) is Phase 2+ scope.
 */

const S3_BASE_URL = process.env.S3_BASE_URL || "";

/** Builds a public URL from a bucket-relative key, if a base URL is configured. */
function urlFromKey(key) {
  if (!key) return null;
  if (!S3_BASE_URL) return null;
  return `${S3_BASE_URL.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
}

module.exports = { urlFromKey };
