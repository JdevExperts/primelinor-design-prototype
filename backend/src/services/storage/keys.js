const crypto = require("node:crypto");
const path = require("node:path");

/** Mirrors the old backend's sanitizeFileName (src/services/s3.js there). */
function sanitizeFileName(name = "file") {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Artwork is never moved between PENDING and ATTACHED — only the
 * ArtworkAsset row's `status` changes (see src/services/artwork.js) — so
 * the key only needs to be globally unique, not encode any lifecycle
 * state.
 */
function generateArtworkKey(originalFileName) {
  const ext = path.extname(originalFileName || "").toLowerCase();
  const base = sanitizeFileName(path.basename(originalFileName || "file", ext)) || "file";
  const unique = crypto.randomUUID();
  return `artwork/${unique}-${base}${ext}`;
}

module.exports = { sanitizeFileName, generateArtworkKey };
