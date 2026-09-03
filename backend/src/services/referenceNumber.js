/**
 * Human-friendly, collision-safe reference numbers: "PL-LD-2026-000123" for
 * Leads, "PL-RQ-2026-000123" for RFQs. Backed by real Postgres SEQUENCEs
 * (lead_reference_seq / rfq_reference_seq, created in the Phase 2
 * migration) rather than a max()+1 read, so two concurrent submissions can
 * never receive the same number.
 *
 * The year in the reference is the year the sequence value was minted, not
 * necessarily the calendar year forever — sequences are never reset, so a
 * reference like "PL-LD-2026-000123" followed by "PL-LD-2027-000124" is
 * expected and fine; references are opaque identifiers, not per-year
 * counters.
 */
const prisma = require("../lib/prisma");

async function nextSequenceValue(sequenceName) {
  const rows = await prisma.$queryRawUnsafe(`SELECT nextval('${sequenceName}') AS value`);
  return Number(rows[0].value);
}

function formatReference(prefix, value) {
  const year = new Date().getFullYear();
  const padded = String(value).padStart(6, "0");
  return `PL-${prefix}-${year}-${padded}`;
}

async function generateLeadReference() {
  const value = await nextSequenceValue("lead_reference_seq");
  return formatReference("LD", value);
}

async function generateRfqReference() {
  const value = await nextSequenceValue("rfq_reference_seq");
  return formatReference("RQ", value);
}

/**
 * Customer-facing group number for a MANUAL (standalone) quotation lineage
 * — "PL-QT-2026-000007". RFQ-origin quotations reuse the RFQ reference
 * instead (see quoteReference.js), so this sequence only advances for
 * manual quotes.
 */
async function generateQuotationGroupReference() {
  const value = await nextSequenceValue("quotation_reference_seq");
  return formatReference("QT", value);
}

module.exports = { generateLeadReference, generateRfqReference, generateQuotationGroupReference, formatReference };
