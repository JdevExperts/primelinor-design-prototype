/**
 * Dev-only route serving locally-stored artwork through the same
 * signed-URL contract a real S3 presigned URL provides — see
 * services/storage/localStorage.js. Only reachable when the LocalStorage
 * backend is active; a real deployment with AWS credentials configured
 * never routes preview traffic through here (getSignedReadUrl returns a
 * direct S3 URL instead).
 */
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const prisma = require("../lib/prisma");
const localStorage = require("../services/storage/localStorage");
const storage = require("../services/storage");

// GET /api/v1/artwork-preview/:key
exports.getArtworkPreview = asyncHandler(async (req, res) => {
  if (storage.isS3) throw ApiError.notFound("Not found");

  // Express already decodes route params (including a %2F-encoded slash),
  // so req.params.key arrives as the plain storage key — decoding again
  // would throw on a key with no remaining %-sequences.
  const key = req.params.key;
  const { expires, sig } = req.query;

  if (!localStorage.verifySignature(key, expires, sig)) {
    throw new ApiError(403, "This preview link has expired.");
  }

  const [buffer, asset] = await Promise.all([
    localStorage.getObjectBuffer(key).catch(() => null),
    prisma.artworkAsset.findFirst({ where: { storageKey: key } }),
  ]);
  if (!buffer || !asset) throw ApiError.notFound("Artwork not found");

  res.type(asset.mimeType);
  res.send(buffer);
});
