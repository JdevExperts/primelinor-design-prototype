/**
 * Artwork upload — creates a PENDING ArtworkAsset, uploaded to private
 * storage before any RFQ exists (Customization Studio uploads the file the
 * moment the user picks it, then references the returned id when the RFQ
 * is submitted). PENDING assets older than the TTL are swept by
 * scripts/cleanupExpiredArtwork.js so an abandoned upload (user picks a
 * file, never submits) doesn't accumulate forever.
 */
const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const storage = require("./storage");
const { validateUploadedFile, sanitizeSvg } = require("./artworkValidation");

const PENDING_TTL_MS = 24 * 60 * 60 * 1000; // 24h — plenty for one browsing session

async function uploadArtwork(file) {
  const result = validateUploadedFile(file);
  if (!result.ok) throw ApiError.badRequest(result.message);

  let buffer = file.buffer;
  if (result.mimeType === "image/svg+xml") {
    buffer = Buffer.from(sanitizeSvg(buffer.toString("utf8")), "utf8");
  }

  const key = storage.generateArtworkKey(file.originalname);
  await storage.putObject({ buffer, contentType: result.mimeType, key });

  const asset = await prisma.artworkAsset.create({
    data: {
      originalFileName: file.originalname || "artwork",
      mimeType: result.mimeType,
      size: buffer.length,
      storageKey: key,
      expiresAt: new Date(Date.now() + PENDING_TTL_MS),
    },
  });

  const previewUrl = await storage.getSignedReadUrl(key, { expiresInSeconds: 900 });

  return {
    id: asset.id,
    originalFileName: asset.originalFileName,
    mimeType: asset.mimeType,
    size: asset.size,
    previewUrl,
  };
}

module.exports = { uploadArtwork, PENDING_TTL_MS };
