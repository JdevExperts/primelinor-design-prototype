const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const ApiError = require("../utils/ApiError");
const solutionAdmin = require("../services/catalogAdmin/solutionAdmin");
const solutionImageAdmin = require("../services/catalogAdmin/solutionImageAdmin");
const { serializeSolutionAdminSummary, serializeSolutionAdminDetail } = require("../services/serializeCatalogAdmin");

exports.list = asyncHandler(async (req, res) => {
  const solutions = await solutionAdmin.listSolutionsAdmin();
  sendSuccess(res, { solutions: solutions.map(serializeSolutionAdminSummary) });
});

exports.get = asyncHandler(async (req, res) => {
  const solution = await solutionAdmin.getSolutionAdmin(req.validated.params.id);
  sendSuccess(res, { solution: serializeSolutionAdminDetail(solution) });
});

exports.create = asyncHandler(async (req, res) => {
  const solution = await solutionAdmin.createSolution(req.validated.body);
  sendSuccess(res, { solution: serializeSolutionAdminDetail({ ...solution, products: [] }) }, 201);
});

exports.update = asyncHandler(async (req, res) => {
  await solutionAdmin.updateSolution(req.validated.params.id, req.validated.body);
  const solution = await solutionAdmin.getSolutionAdmin(req.validated.params.id);
  sendSuccess(res, { solution: serializeSolutionAdminDetail(solution) });
});

exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file was received.");
  await solutionImageAdmin.setSolutionImage(req.validated.params.id, req.file, req.validated.body);
  const solution = await solutionAdmin.getSolutionAdmin(req.validated.params.id);
  sendSuccess(res, { solution: serializeSolutionAdminDetail(solution) });
});

exports.removeImage = asyncHandler(async (req, res) => {
  await solutionImageAdmin.removeSolutionImage(req.validated.params.id);
  const solution = await solutionAdmin.getSolutionAdmin(req.validated.params.id);
  sendSuccess(res, { solution: serializeSolutionAdminDetail(solution) });
});

// ── Product mapping ──────────────────────────────────────────────────────────

exports.addProduct = asyncHandler(async (req, res) => {
  await solutionAdmin.addSolutionProduct(req.validated.params.id, req.validated.body);
  const solution = await solutionAdmin.getSolutionAdmin(req.validated.params.id);
  sendSuccess(res, { solution: serializeSolutionAdminDetail(solution) }, 201);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const { id, productId } = req.validated.params;
  await solutionAdmin.updateSolutionProduct(id, productId, req.validated.body);
  const solution = await solutionAdmin.getSolutionAdmin(id);
  sendSuccess(res, { solution: serializeSolutionAdminDetail(solution) });
});

exports.removeProduct = asyncHandler(async (req, res) => {
  const { id, productId } = req.validated.params;
  await solutionAdmin.removeSolutionProduct(id, productId);
  const solution = await solutionAdmin.getSolutionAdmin(id);
  sendSuccess(res, { solution: serializeSolutionAdminDetail(solution) });
});
