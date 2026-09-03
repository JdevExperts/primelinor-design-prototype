const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeParty,
  partyFromRfq,
  buildLinesFromWorkingItems,
} = require("../src/services/quotationService");
const { fromRfqItem } = require("../src/services/rfqWorkingItems");
const { quotationReference } = require("../src/services/quoteReference");
const { computeQuotationTotals } = require("../src/services/quotationTotals");

// ── Working requirement seed (Phase C §76.1) ───────────────────────────

test("fromRfqItem: copies snapshot fields into a working-item shape", () => {
  const wi = fromRfqItem(
    {
      productId: "p1",
      productCodeSnapshot: "PL-UN-001",
      productNameSnapshot: "Uniform Tee",
      description: null,
      quantity: 250,
      unitSnapshot: "piece",
      specSnapshot: "220 GSM",
      colorNameSnapshot: null,
      variantLabelSnapshot: null,
    },
    0,
  );
  assert.equal(wi.productCodeSnapshot, "PL-UN-001");
  assert.equal(wi.productNameSnapshot, "Uniform Tee");
  assert.equal(wi.quantity, 250);
  assert.equal(wi.unit, "piece");
  assert.equal(wi.sortOrder, 0);
});

test("buildLinesFromWorkingItems: each working item becomes a PRODUCT line, custom lines allowed, no fake rate", () => {
  const lines = buildLinesFromWorkingItems([
    { sortOrder: 0, productId: "p1", productCodeSnapshot: "PL-UN-001", productNameSnapshot: "Uniform Tee", quantity: 300, unit: "piece" },
    { sortOrder: 1, productId: null, description: "Custom embroidery setup", quantity: 1, unit: "lot" },
  ]);
  assert.equal(lines.length, 2);
  assert.equal(lines[0].productCode, "PL-UN-001");
  assert.equal(lines[0].quantity, 300);
  assert.equal(lines[0].unitPrice, undefined); // sales enters the rate
  assert.equal(lines[1].description, "Custom embroidery setup");
  assert.equal(lines[1].productId, undefined);
});

// ── Party snapshot (AA-2 / §77.U) ─────────────────────────────────────

test("normalizeParty: trims, drops blanks, requires a name to be meaningful", () => {
  const p = normalizeParty({ name: "  Acme Corp  ", phone: "", email: "a@b.com", gstin: "  29ABCDE1234F1Z5 " });
  assert.equal(p.partyName, "Acme Corp");
  assert.equal(p.partyPhone, null);
  assert.equal(p.partyEmail, "a@b.com");
  assert.equal(p.partyGstin, "29ABCDE1234F1Z5");
  assert.equal(p.partyContactPerson, null);
});

test("normalizeParty: accepts already-prefixed keys too (revision carry-forward)", () => {
  const p = normalizeParty({ partyName: "Beta Ltd", partyAddress: "MG Road" });
  assert.equal(p.partyName, "Beta Ltd");
  assert.equal(p.partyAddress, "MG Road");
});

test("partyFromRfq: prefers company name, falls back to contact, carries phone/email", () => {
  const p = partyFromRfq({
    contact: { name: "Priya", phoneRaw: "98765 43210", email: "priya@acme.com", company: { name: "Acme Corp" } },
  });
  assert.equal(p.partyName, "Acme Corp");
  assert.equal(p.partyContactPerson, "Priya");
  assert.equal(p.partyPhone, "98765 43210");
  assert.equal(p.partyEmail, "priya@acme.com");
});

// ── Reference numbering (AA-3 / §77) ──────────────────────────────────

test("quotationReference: RFQ-origin reuses the RFQ reference", () => {
  assert.equal(quotationReference({ reference: "PL-RQ-2026-000030" }, { version: 2 }), "PL-RQ-2026-000030-V2");
});

test("quotationReference: MANUAL uses its own group reference, no RFQ needed", () => {
  assert.equal(
    quotationReference(null, { groupReference: "PL-QT-2026-000007", version: 1 }),
    "PL-QT-2026-000007-V1",
  );
});

// ── Same engine: totals identical whatever the origin ─────────────────

test("computeQuotationTotals: a manual quote's lines total the same way as an RFQ quote's", () => {
  const lines = [
    { lineType: "PRODUCT", quantity: 200, unitPrice: 120 },
    { lineType: "SHIPPING", description: "Delivery", lineTotal: 800 },
  ];
  const result = computeQuotationTotals(lines, undefined);
  assert.equal(result.subtotal, 24800);
  assert.equal(result.grandTotal, 24800);
  assert.equal(result.pricingComplete, true);
});
