const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const productAdmin = require("../services/catalogAdmin/productAdmin");
const productAttributes = require("../services/productAttributeService");
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

// ── Product attribute framework (ADMIN only — enforced at the route) ────

// PUT /admin/catalog/products/:id/attributes/:key   body { value }
// Upsert one attribute value (validated against the config's valueType).
// The frontend's "Reopen Review" calls this with key=PRODUCT_REVIEW_PENDING,
// value=true.
exports.setAttribute = asyncHandler(async (req, res) => {
  const { id, key } = req.validated.params;
  await productAttributes.upsertProductAttribute(id, key, req.validated.body.value);
  const product = await productAdmin.getProductAdmin(id);
  sendSuccess(res, { product: serializeProductAdminDetail(product) });
});

// DELETE /admin/catalog/products/:id/attributes/:key
// Remove the attribute row (idempotent). "Mark Review Complete" calls this
// with key=PRODUCT_REVIEW_PENDING — absence means review complete (§11).
exports.removeAttribute = asyncHandler(async (req, res) => {
  const { id, key } = req.validated.params;
  await productAttributes.removeProductAttribute(id, key);
  const product = await productAdmin.getProductAdmin(id);
  sendSuccess(res, { product: serializeProductAdminDetail(product) });
});
