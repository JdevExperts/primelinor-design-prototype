/**
 * Product image validation — deliberately narrower than customer artwork
 * (artworkValidation.js): raster formats only, no SVG (Phase 5 §76). Product
 * images are public catalogue content served directly to every site
 * visitor, so there's no case here for SVG's customization/overlay use
 * (that's what ProductAsset.supportsArtworkOverlay + PlacementZone are
 * for, layered over a raster photo) — and skipping SVG entirely sidesteps
 * needing a second sanitizer surface for a format this endpoint doesn't
 * need to accept.
 */
const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function looksLikePng(buffer) {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return sig.every((byte, i) => buffer[i] === byte);
}

function looksLikeJpeg(buffer) {
  return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

function looksLikeWebp(buffer) {
  return (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  );
}

function detectMimeType(buffer) {
  if (looksLikePng(buffer)) return "image/png";
  if (looksLikeJpeg(buffer)) return "image/jpeg";
  if (looksLikeWebp(buffer)) return "image/webp";
  return null;
}

/** Validates size + sniffed content type. Does NOT trust file.mimetype. */
function validateUploadedProductImage(file) {
  if (!file || !file.buffer?.length) {
    return { ok: false, message: "No file was received." };
  }
  if (file.size > MAX_SIZE_BYTES || file.buffer.length > MAX_SIZE_BYTES) {
    return { ok: false, message: "File is too large — please keep it under 8 MB." };
  }
  const detected = detectMimeType(file.buffer);
  if (!detected || !ACCEPTED_TYPES.includes(detected)) {
    return { ok: false, message: "Please upload a PNG, JPG or WEBP image." };
  }
  return { ok: true, mimeType: detected };
}

module.exports = { MAX_SIZE_BYTES, ACCEPTED_TYPES, detectMimeType, validateUploadedProductImage };
