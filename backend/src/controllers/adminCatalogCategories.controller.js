const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const ApiError = require("../utils/ApiError");
const categoryAdmin = require("../services/catalogAdmin/categoryAdmin");
const categoryImageAdmin = require("../services/catalogAdmin/categoryImageAdmin");
const { serializeCategoryAdmin } = require("../services/serializeCatalogAdmin");

exports.list = asyncHandler(async (req, res) => {
  const categories = await categoryAdmin.listCategoriesAdmin();
  sendSuccess(res, { categories: categories.map(serializeCategoryAdmin) });
});

exports.create = asyncHandler(async (req, res) => {
  const category = await categoryAdmin.createCategory(req.validated.body);
  sendSuccess(res, { category: serializeCategoryAdmin(category) }, 201);
});

exports.update = asyncHandler(async (req, res) => {
  const category = await categoryAdmin.updateCategory(req.validated.params.id, req.validated.body);
  sendSuccess(res, { category: serializeCategoryAdmin(category) });
});

// POST /admin/catalog/categories/:id/image  (multipart)
exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file was received.");
  const category = await categoryImageAdmin.setCategoryImage(req.validated.params.id, req.file, req.validated.body);
  sendSuccess(res, { category: serializeCategoryAdmin(category) });
});

// DELETE /admin/catalog/categories/:id/image
exports.removeImage = asyncHandler(async (req, res) => {
  const category = await categoryImageAdmin.removeCategoryImage(req.validated.params.id);
  sendSuccess(res, { category: serializeCategoryAdmin(category) });
});
