const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const rfqAdmin = require("../services/rfqAdmin");
const workingItems = require("../services/rfqWorkingItems");
const { serializeRfqSummary, serializeRfqDetail, serializeNote, serializeWorkingItem } = require("../services/serializeAdmin");

// GET /api/v1/admin/rfqs
exports.listRfqs = asyncHandler(async (req, res) => {
  const query = req.validated.query;
  const { rfqs, total } = await rfqAdmin.listRfqs(query);
  sendSuccess(res, { rfqs: rfqs.map(serializeRfqSummary), total, page: query.page, limit: query.limit });
});

// GET /api/v1/admin/rfqs/:id
exports.getRfq = asyncHandler(async (req, res) => {
  const rfq = await rfqAdmin.getRfq(req.validated.params.id);
  sendSuccess(res, { rfq: await serializeRfqDetail(rfq) });
});

// PATCH /api/v1/admin/rfqs/:id
exports.updateRfq = asyncHandler(async (req, res) => {
  const rfq = await rfqAdmin.updateRfq(req.validated.params.id, req.validated.body, req.staffUser);
  sendSuccess(res, { rfq: await serializeRfqDetail(rfq) });
});

// POST /api/v1/admin/rfqs/:id/notes
exports.addNote = asyncHandler(async (req, res) => {
  const note = await rfqAdmin.addNote(req.validated.params.id, req.staffUser, req.validated.body.body);
  sendSuccess(res, { note: serializeNote(note) }, 201);
});

// POST /api/v1/admin/rfqs/:id/items
exports.addItem = asyncHandler(async (req, res) => {
  const rfq = await rfqAdmin.addItem(req.validated.params.id, req.validated.body);
  sendSuccess(res, { rfq: await serializeRfqDetail(rfq) }, 201);
});

// ── Working requirement (Phase C) ──────────────────────────────────────
exports.addWorkingItem = asyncHandler(async (req, res) => {
  const list = await workingItems.addWorkingItem(req.validated.params.id, req.staffUser, req.validated.body);
  sendSuccess(res, { workingItems: list.map(serializeWorkingItem) }, 201);
});

exports.updateWorkingItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.validated.params;
  const list = await workingItems.updateWorkingItem(id, itemId, req.staffUser, req.validated.body);
  sendSuccess(res, { workingItems: list.map(serializeWorkingItem) });
});

exports.removeWorkingItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.validated.params;
  const list = await workingItems.removeWorkingItem(id, itemId, req.staffUser);
  sendSuccess(res, { workingItems: list.map(serializeWorkingItem) });
});

exports.reorderWorkingItems = asyncHandler(async (req, res) => {
  const list = await workingItems.reorderWorkingItems(
    req.validated.params.id,
    req.validated.body.orderedIds,
    req.staffUser,
  );
  sendSuccess(res, { workingItems: list.map(serializeWorkingItem) });
});
