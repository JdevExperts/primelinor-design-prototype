/**
 * multer memoryStorage — mirrors uploadArtwork.js's pattern. The buffer is
 * validated (magic bytes, size) in productAssetValidation.js before ever
 * touching disk/S3, so nothing here is authoritative.
 */
const multer = require("multer");
const { MAX_SIZE_BYTES } = require("../services/productAssetValidation");

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
}).single("file");
