const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const { uploadArtwork } = require("../services/artworkService");

// POST /api/v1/uploads/artwork
exports.uploadArtwork = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file was received.");
  const artwork = await uploadArtwork(req.file);
  sendSuccess(res, { artwork }, 201);
});
