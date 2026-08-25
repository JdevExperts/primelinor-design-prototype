/**
 * Customer-facing quotation shape (Phase 4 §7). Deliberately excludes:
 * internal notes, assigned staff, activity log, staff-only metadata,
 * storage keys, and every internal id except what the page itself needs
 * to render (line ids, purely for React keys — not guessable/useful on
 * their own).
 */
const { quotationReference } = require("./quoteReference");
const { actionEligibility, isExpired } = require("./publicQuoteService");

function serializeLine(line) {
  return {
    id: line.id,
    lineType: line.lineType,
    description: line.description,
    quantity: line.quantity,
    unit: line.unit,
    unitPrice: line.unitPrice != null ? Number(line.unitPrice) : null,
    lineTotal: Number(line.lineTotal),
  };
}

function serializePublicQuote(quotation) {
  const rfq = quotation.rfq;
  const eligibility = actionEligibility(quotation, rfq);

  return {
    reference: quotationReference(rfq, quotation),
    rfqReference: rfq.reference,
    version: quotation.version,
    status: quotation.status,
    isExpired: isExpired(quotation),
    isSuperseded: quotation.status === "SUPERSEDED",
    actions: {
      canAccept: eligibility.canAccept,
      canDecline: eligibility.canDecline,
      canRequestRevision: eligibility.canRequestRevision,
    },
    customer: {
      name: rfq.contact.name,
      companyName: rfq.contact.company?.name || rfq.contact.companyNameRaw || null,
    },
    currency: quotation.currency,
    lines: (quotation.lines || []).map(serializeLine),
    subtotal: Number(quotation.subtotal),
    taxMode: quotation.taxMode,
    taxAmount: quotation.taxAmount != null ? Number(quotation.taxAmount) : null,
    grandTotal: Number(quotation.grandTotal),
    validUntil: quotation.validUntil,
    customerNotes: quotation.customerNotes,
    sentAt: quotation.sentAt,
    viewedAt: quotation.viewedAt,
    respondedAt: quotation.respondedAt,
    requestSummary: {
      sourceType: rfq.sourceType,
      message: rfq.message,
    },
  };
}

module.exports = { serializePublicQuote };
