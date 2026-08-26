const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const tagAdmin = require("../services/catalogAdmin/tagAdmin");
const { serializeTagAdmin } = require("../services/serializeCatalogAdmin");

exports.list = asyncHandler(async (req, res) => {
  const tags = await tagAdmin.listTagsAdmin();
  sendSuccess(res, { tags: tags.map(serializeTagAdmin) });
});

exports.create = asyncHandler(async (req, res) => {
  const tag = await tagAdmin.createTag(req.validated.body);
  sendSuccess(res, { tag: serializeTagAdmin(tag) }, 201);
});
