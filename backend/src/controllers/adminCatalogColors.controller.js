const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const colorAdmin = require("../services/catalogAdmin/colorAdmin");
const { serializeColorAdmin } = require("../services/serializeCatalogAdmin");

exports.list = asyncHandler(async (req, res) => {
  const colors = await colorAdmin.listColorsAdmin();
  sendSuccess(res, { colors: colors.map(serializeColorAdmin) });
});

exports.create = asyncHandler(async (req, res) => {
  const color = await colorAdmin.createColor(req.validated.body);
  sendSuccess(res, { color: serializeColorAdmin(color) }, 201);
});

exports.update = asyncHandler(async (req, res) => {
  const color = await colorAdmin.updateColor(req.validated.params.id, req.validated.body);
  sendSuccess(res, { color: serializeColorAdmin(color) });
});
