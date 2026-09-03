const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const dashboard = require("../services/dashboardService");

const period = (req) => req.validated?.query?.period || "7d";

exports.overview = asyncHandler(async (req, res) => {
  sendSuccess(res, await dashboard.overview({ period: period(req) }));
});

exports.website = asyncHandler(async (req, res) => {
  sendSuccess(res, await dashboard.website({ period: period(req) }));
});

exports.sales = asyncHandler(async (req, res) => {
  sendSuccess(res, await dashboard.sales({ period: period(req) }));
});

exports.products = asyncHandler(async (req, res) => {
  sendSuccess(res, await dashboard.products({ period: period(req) }));
});

exports.catalogueHealth = asyncHandler(async (req, res) => {
  sendSuccess(res, await dashboard.catalogueHealth());
});
