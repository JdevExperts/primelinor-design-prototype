const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const publicQuoteService = require("../services/publicQuoteService");
const { serializePublicQuote } = require("../services/serializePublicQuote");
const { renderQuotePdf } = require("../services/quotePdf");

// GET /api/v1/quotes/:token
exports.getQuote = asyncHandler(async (req, res) => {
  const { quotation } = await publicQuoteService.resolveQuoteByToken(req.validated.params.token);
  sendSuccess(res, { quote: serializePublicQuote(quotation) });
});

// POST /api/v1/quotes/:token/accept
exports.accept = asyncHandler(async (req, res) => {
  const quotation = await publicQuoteService.acceptQuoteByToken(req.validated.params.token);
  sendSuccess(res, { quote: serializePublicQuote(quotation) });
});

// POST /api/v1/quotes/:token/decline
exports.decline = asyncHandler(async (req, res) => {
  const quotation = await publicQuoteService.declineQuoteByToken(req.validated.params.token, req.validated.body.message);
  sendSuccess(res, { quote: serializePublicQuote(quotation) });
});

// POST /api/v1/quotes/:token/request-revision
exports.requestRevision = asyncHandler(async (req, res) => {
  const quotation = await publicQuoteService.requestRevisionByToken(
    req.validated.params.token,
    req.validated.body.message,
  );
  sendSuccess(res, { quote: serializePublicQuote(quotation) });
});

// GET /api/v1/quotes/:token/pdf
exports.getPdf = asyncHandler(async (req, res) => {
  const { quotation } = await publicQuoteService.resolveQuoteByToken(req.validated.params.token);
  const quote = serializePublicQuote(quotation);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${quote.reference}.pdf"`);
  renderQuotePdf(quote).pipe(res);
});
