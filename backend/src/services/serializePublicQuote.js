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
    // Frozen when this quotation version was created (§16/§17/§39/§59).
    productName: line.productNameSnapshot || null,
    productCode: line.productCodeSnapshot || null,
    quantity: line.quantity,
    unit: line.unit,
    unitPrice: line.unitPrice != null ? Number(line.unitPrice) : null,
    lineTotal: line.lineTotal != null ? Number(line.lineTotal) : null,
  };
}

function serializePublicQuote(quotation) {
  const rfq = quotation.rfq || null;
  const eligibility = actionEligibility(quotation, rfq);

  // The party the quote is prepared for. RFQ-origin: the RFQ's contact
  // (falls back to the party snapshot). MANUAL: the quotation's own party
  // snapshot, entered by sales.
  const contact = rfq?.contact || null;
  const customer = {
    name: contact?.name || quotation.partyContactPerson || quotation.partyName || null,
    companyName:
      contact?.company?.name || contact?.companyNameRaw || (contact ? null : quotation.partyName) || null,
    phone: contact?.phoneRaw || contact?.phone || quotation.partyPhone || null,
    email: contact?.email || quotation.partyEmail || null,
    gstin: quotation.partyGstin || null,
    address: quotation.partyAddress || null,
  };

  return {
    reference: quotationReference(rfq, quotation),
    rfqReference: rfq?.reference || null,
    originType: quotation.originType,
    version: quotation.version,
    status: quotation.status,
    isExpired: isExpired(quotation),
    isSuperseded: quotation.status === "SUPERSEDED",
    isCancelled: quotation.status === "CANCELLED",
    actions: {
      canAccept: eligibility.canAccept,
      canDecline: eligibility.canDecline,
      canRequestRevision: eligibility.canRequestRevision,
    },
    customer,
    createdAt: quotation.createdAt,
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
    requestSummary: rfq ? { sourceType: rfq.sourceType, message: rfq.message } : null,
  };
}

module.exports = { serializePublicQuote };
