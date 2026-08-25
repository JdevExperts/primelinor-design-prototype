const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const leadAdmin = require("../services/leadAdmin");
const { serializeLeadSummary, serializeLeadDetail, serializeRfqDetail } = require("../services/serializeAdmin");
const { getRfq } = require("../services/rfqAdmin");

// GET /api/v1/admin/leads
exports.listLeads = asyncHandler(async (req, res) => {
  const query = req.validated.query;
  const { leads, total } = await leadAdmin.listLeads(query);
  sendSuccess(res, { leads: leads.map(serializeLeadSummary), total, page: query.page, limit: query.limit });
});

// GET /api/v1/admin/leads/:id
exports.getLead = asyncHandler(async (req, res) => {
  const lead = await leadAdmin.getLead(req.validated.params.id);
  sendSuccess(res, { lead: serializeLeadDetail(lead) });
});

// PATCH /api/v1/admin/leads/:id
exports.updateLead = asyncHandler(async (req, res) => {
  const lead = await leadAdmin.updateLead(req.validated.params.id, req.validated.body);
  sendSuccess(res, { lead: serializeLeadDetail(lead) });
});

// POST /api/v1/admin/leads/:id/convert
exports.convertLead = asyncHandler(async (req, res) => {
  const rfq = await leadAdmin.convertLeadToRfq(req.validated.params.id, req.staffUser, req.validated.body);
  const detailed = await getRfq(rfq.id);
  sendSuccess(res, { rfq: await serializeRfqDetail(detailed) }, 201);
});
