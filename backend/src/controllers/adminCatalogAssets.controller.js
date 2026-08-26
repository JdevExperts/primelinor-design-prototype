const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const ApiError = require("../utils/ApiError");
const productAssetAdmin = require("../services/catalogAdmin/productAssetAdmin");
const { serializeAssetAdmin } = require("../services/serializeCatalogAdmin");

// POST /admin/catalog/products/:id/assets/upload  (multipart)
exports.upload = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file was received.");
  const asset = await productAssetAdmin.createAssetFromUpload(req.validated.params.id, req.file, req.validated.body);
  sendSuccess(res, { asset: serializeAssetAdmin(asset) }, 201);
});

// POST /admin/catalog/products/:id/assets  (JSON, existing URL)
exports.createFromUrl = asyncHandler(async (req, res) => {
  const asset = await productAssetAdmin.createAssetFromUrl(req.validated.params.id, req.validated.body);
  sendSuccess(res, { asset: serializeAssetAdmin(asset) }, 201);
});

// PATCH /admin/catalog/products/:id/assets/:assetId
exports.update = asyncHandler(async (req, res) => {
  const asset = await productAssetAdmin.updateAsset(req.validated.params.id, req.validated.params.assetId, req.validated.body);
  sendSuccess(res, { asset: serializeAssetAdmin(asset) });
});

// DELETE /admin/catalog/products/:id/assets/:assetId
exports.remove = asyncHandler(async (req, res) => {
  const result = await productAssetAdmin.deleteAsset(req.validated.params.id, req.validated.params.assetId);
  sendSuccess(res, result);
});
