const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const quotationService = require("../services/quotationService");
const quotationNotes = require("../services/quotationNotes");
const {
  serializeQuotationSummary,
  serializeQuotationDetail,
  serializeInternalNote,
} = require("../services/serializeAdmin");
const { serializePublicQuote } = require("../services/serializePublicQuote");
const { renderQuotePdf } = require("../services/quotePdf");
const { buildCustomerQuoteUrl } = require("../services/publicUrls");
const prisma = require("../lib/prisma");

/** Attaches a one-time customerQuoteUrl to the response when a fresh raw token exists. */
function withLinkPayload(quotation) {
  const payload = { quotation: serializeQuotationDetail(quotation) };
  if (quotation.rawAccessToken) {
    payload.customerQuoteUrl = buildCustomerQuoteUrl(quotation.rawAccessToken);
  }
  return payload;
}

// GET /api/v1/admin/rfqs/:rfqId/quotations
exports.listForRfq = asyncHandler(async (req, res) => {
  const quotations = await quotationService.listQuotationsForRfq(req.validated.params.rfqId);
  sendSuccess(res, { quotations: quotations.map(serializeQuotationSummary) });
});

// GET /api/v1/admin/quotations  — top-level list (Phase E §36)
exports.list = asyncHandler(async (req, res) => {
  const { quotations, total, page, limit } = await quotationService.listQuotations(req.validated.query);
  sendSuccess(res, { quotations: quotations.map(serializeQuotationSummary), total, page, limit });
});

// POST /api/v1/admin/quotations/manual  — standalone quotation (Phase E)
exports.createManual = asyncHandler(async (req, res) => {
  const quotation = await quotationService.createManualQuotation(req.staffUser, req.validated.body);
  sendSuccess(res, { quotation: serializeQuotationDetail(quotation) }, 201);
});

// POST /api/v1/admin/rfqs/:rfqId/quotations
exports.create = asyncHandler(async (req, res) => {
  const quotation = await quotationService.createQuotation(req.validated.params.rfqId, req.staffUser, req.validated.body);
  sendSuccess(res, { quotation: serializeQuotationDetail(quotation) }, 201);
});

// GET /api/v1/admin/quotations/:id
exports.get = asyncHandler(async (req, res) => {
  const quotation = await quotationService.getQuotation(req.validated.params.id);
  sendSuccess(res, { quotation: serializeQuotationDetail(quotation) });
});

// PATCH /api/v1/admin/quotations/:id
exports.update = asyncHandler(async (req, res) => {
  const quotation = await quotationService.updateQuotation(req.validated.params.id, req.staffUser, req.validated.body);
  sendSuccess(res, { quotation: serializeQuotationDetail(quotation) });
});

// POST /api/v1/admin/quotations/:id/revise  — new version from any issued state
exports.revise = asyncHandler(async (req, res) => {
  const created = await quotationService.createRevision(
    req.validated.params.id,
    req.staffUser,
    req.validated.body,
  );
  // Re-load so the response carries the full detail shape (resolved
  // reference, version history, notes) the editor expects.
  const quotation = await quotationService.getQuotation(created.id);
  sendSuccess(res, { quotation: serializeQuotationDetail(quotation) }, 201);
});

// POST /api/v1/admin/quotations/:id/cancel  — staff-void a mistaken quotation
exports.cancel = asyncHandler(async (req, res) => {
  const quotation = await quotationService.cancelQuotation(
    req.validated.params.id,
    req.staffUser,
    req.validated.body,
  );
  sendSuccess(res, { quotation: serializeQuotationDetail(quotation) });
});

// GET /api/v1/admin/quotations/:id/notes
exports.listNotes = asyncHandler(async (req, res) => {
  const notes = await quotationNotes.listNotes(req.validated.params.id);
  sendSuccess(res, { notes: notes.map(serializeInternalNote) });
});

// POST /api/v1/admin/quotations/:id/notes
exports.addNote = asyncHandler(async (req, res) => {
  const note = await quotationNotes.addNote(req.validated.params.id, req.staffUser, req.validated.body.body);
  sendSuccess(res, { note: serializeInternalNote(note) }, 201);
});

// PATCH /api/v1/admin/quotations/:id/notes/:noteId
exports.updateNote = asyncHandler(async (req, res) => {
  const note = await quotationNotes.updateNote(
    req.validated.params.id,
    req.validated.params.noteId,
    req.staffUser,
    req.validated.body.body,
  );
  sendSuccess(res, { note: serializeInternalNote(note) });
});

// POST /api/v1/admin/quotations/:id/import-rfq-items
exports.importRfqItems = asyncHandler(async (req, res) => {
  const quotation = await quotationService.importRfqItems(req.validated.params.id, req.staffUser);
  sendSuccess(res, { quotation: serializeQuotationDetail(quotation) });
});

// POST /api/v1/admin/quotations/:id/send
exports.send = asyncHandler(async (req, res) => {
  const quotation = await quotationService.sendQuotation(req.validated.params.id, req.staffUser);
  sendSuccess(res, { ...withLinkPayload(quotation), delivery: "not_yet_implemented" });
});

// POST /api/v1/admin/quotations/:id/link/regenerate
exports.regenerateLink = asyncHandler(async (req, res) => {
  const quotation = await quotationService.regenerateAccessToken(req.validated.params.id, req.staffUser);
  sendSuccess(res, withLinkPayload(quotation));
});

// POST /api/v1/admin/quotations/:id/link/revoke
exports.revokeLink = asyncHandler(async (req, res) => {
  const quotation = await quotationService.revokeAccessToken(req.validated.params.id, req.staffUser);
  sendSuccess(res, { quotation: serializeQuotationDetail(quotation) });
});

// GET /api/v1/admin/quotations/:id/pdf
exports.getPdf = asyncHandler(async (req, res) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: req.validated.params.id },
    include: { lines: { orderBy: { sortOrder: "asc" } }, rfq: { include: { contact: { include: { company: true } } } } },
  });
  if (!quotation) return res.status(404).json({ success: false, message: "Quotation not found" });

  const quote = serializePublicQuote(quotation);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${quote.reference}.pdf"`);
  renderQuotePdf(quote).pipe(res);
});

// POST /api/v1/admin/quotations/:id/accept
exports.accept = asyncHandler(async (req, res) => {
  const quotation = await quotationService.acceptQuotation(req.validated.params.id, req.staffUser);
  sendSuccess(res, { quotation: serializeQuotationDetail(quotation) });
});

// POST /api/v1/admin/quotations/:id/reject
exports.reject = asyncHandler(async (req, res) => {
  const quotation = await quotationService.rejectQuotation(req.validated.params.id, req.staffUser, req.validated.body);
  sendSuccess(res, { quotation: serializeQuotationDetail(quotation) });
});
