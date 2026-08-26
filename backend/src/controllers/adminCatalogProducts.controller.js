const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const productAdmin = require("../services/catalogAdmin/productAdmin");
const { serializeProductAdminSummary, serializeProductAdminDetail } = require("../services/serializeCatalogAdmin");

exports.list = asyncHandler(async (req, res) => {
  const { products, total, page, limit } = await productAdmin.listProductsAdmin(req.validated.query);
  sendSuccess(res, { products: products.map(serializeProductAdminSummary), total, page, limit });
});

exports.get = asyncHandler(async (req, res) => {
  const product = await productAdmin.getProductAdmin(req.validated.params.id);
  sendSuccess(res, { product: serializeProductAdminDetail(product) });
});

exports.create = asyncHandler(async (req, res) => {
  const product = await productAdmin.createProduct(req.validated.body, req.staffUser);
  sendSuccess(res, { product: serializeProductAdminDetail(product) }, 201);
});

exports.update = asyncHandler(async (req, res) => {
  const product = await productAdmin.updateProduct(req.validated.params.id, req.validated.body, req.staffUser);
  sendSuccess(res, { product: serializeProductAdminDetail(product) });
});

exports.duplicate = asyncHandler(async (req, res) => {
  const product = await productAdmin.duplicateProduct(req.validated.params.id, req.validated.body, req.staffUser);
  sendSuccess(res, { product: serializeProductAdminDetail(product) }, 201);
});
