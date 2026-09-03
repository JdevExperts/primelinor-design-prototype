/**
 * Customer-facing quotation reference. RFQ-origin quotations reuse the
 * RFQ's own reference (PL-RQ-…-V#) — the customer already has it and it
 * ties the quote to their request. MANUAL (standalone) quotations have no
 * RFQ, so they carry their own group reference (PL-QT-…-V#), minted from
 * the quotation_reference_seq at V1 (Phase E / AA-3).
 */
function quotationReference(rfq, quotation) {
  const base = quotation.groupReference || rfq?.reference || quotation.quotationGroupId;
  return `${base}-V${quotation.version}`;
}

module.exports = { quotationReference };
