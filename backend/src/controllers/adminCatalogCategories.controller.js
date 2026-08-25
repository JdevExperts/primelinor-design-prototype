const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const categoryAdmin = require("../services/catalogAdmin/categoryAdmin");
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
