import { apiUpload } from "./http";

/**
 * Uploads one artwork file immediately (before any RFQ exists) and returns
 * its id + a short-lived preview URL. The returned `id` is what
 * customizationData.front/back.artworkAssetId references when the RFQ is
 * later submitted (see src/api/rfqs.js) — the file is never re-sent as part
 * of the RFQ payload itself.
 *
 * @param {File} file
 * @returns {Promise<{id, originalFileName, mimeType, size, previewUrl}>}
 */
export async function uploadArtwork(file) {
  const { artwork } = await apiUpload("/uploads/artwork", file);
  return artwork;
}
