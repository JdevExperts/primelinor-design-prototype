/**
 * Customer-facing quotation reference (Phase 4 §29). Deliberately NOT a
 * separate sequence/model: a Quotation is always one version of exactly
 * one RFQ's commercial negotiation, never an independent entity, so
 * reusing the RFQ's own reference — which the customer already has from
 * their original submission — is more meaningful than minting an
 * unrelated PL-QT-... number, and it avoids a second sequence purely for
 * cosmetic identification.
 */
function quotationReference(rfq, quotation) {
  return `${rfq.reference}-V${quotation.version}`;
}

module.exports = { quotationReference };
