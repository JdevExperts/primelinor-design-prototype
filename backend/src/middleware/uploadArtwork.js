/**
 * multer memoryStorage — the buffer is validated (magic bytes, size) and
 * sanitized (SVG) in artworkService.js before ever touching disk/S3, so
 * nothing here is authoritative. This layer just bounds request size early
 * and gives multer's own error shape (handled in errorHandler.js) instead
 * of buffering an oversized upload all the way to the controller.
 */
const multer = require("multer");
const { MAX_SIZE_BYTES } = require("../services/artworkValidation");

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
}).single("file");
