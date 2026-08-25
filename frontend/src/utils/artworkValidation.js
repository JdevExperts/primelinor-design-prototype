const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Client-side UX validation only — a fast, friendly check before an object
 * URL is even created. The eventual backend upload endpoint (Phase 2+)
 * remains the authoritative check; this never replaces it.
 */
export function validateArtworkFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, message: "Please upload a PNG, JPG or SVG file." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, message: "File is too large — please keep it under 10 MB." };
  }
  return { ok: true };
}
