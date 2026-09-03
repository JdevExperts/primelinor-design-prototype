const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildLinesFromRfqItems,
  buildLinesFromQuotation,
  quotationSendBlockers,
  usableRate,
} = require("../src/services/quotationService");
const { computeQuotationTotals, lineNeedsRate } = require("../src/services/quotationTotals");

// ── Auto-population from RFQ items (§9/§76 A–D) ─────────────────────────

const RFQ_ITEMS = [
  {
    id: "item-1",
    sortOrder: 0,
    productId: "prod-uniform",
    productNameSnapshot: "Corporate Staff Uniform T-Shirt",
    productCodeSnapshot: "PL-UN-001",
    description: null,
    quantity: 250,
    unitSnapshot: "piece",
    estimatedUnitPrice: null, // QUOTE_ONLY — no reliable estimate
  },
  {
    id: "item-2",
    sortOrder: 1,
    productId: "prod-polo",
    productNameSnapshot: "Eco Polo T-Shirt",
    productCodeSnapshot: "PL-PO-001",
    description: null,
    quantity: 100,
    unitSnapshot: "piece",
    estimatedUnitPrice: 285, // website estimate available
  },
];

test("buildLinesFromRfqItems: copies every item as a PRODUCT line (§76 A)", () => {
  const lines = buildLinesFromRfqItems(RFQ_ITEMS);
  assert.equal(lines.length, 2);
  assert.ok(lines.every((l) => l.lineType === "PRODUCT"));
});

test("buildLinesFromRfqItems: quantity and unit are carried over (§76 B)", () => {
  const [uniform, polo] = buildLinesFromRfqItems(RFQ_ITEMS);
  assert.equal(uniform.quantity, 250);
  assert.equal(uniform.unit, "piece");
  assert.equal(polo.quantity, 100);
});

test("buildLinesFromRfqItems: Product Code and name are carried over (§76 C)", () => {
  const [uniform] = buildLinesFromRfqItems(RFQ_ITEMS);
  assert.equal(uniform.productCode, "PL-UN-001");
  assert.equal(uniform.productNameSnapshot, "Corporate Staff Uniform T-Shirt");
  assert.equal(uniform.description, "Corporate Staff Uniform T-Shirt");
  assert.equal(uniform.productId, "prod-uniform");
});

test("buildLinesFromRfqItems: a QUOTE_ONLY / no-estimate item gets NO rate, never a fake ₹0 (§76 D, §10/§11)", () => {
  const [uniform, polo] = buildLinesFromRfqItems(RFQ_ITEMS);
  assert.equal(uniform.unitPrice, undefined); // rate required
  assert.equal(polo.unitPrice, 285); // real estimate seeded as an editable starting value
});

test("usableRate: only a finite positive number survives; 0 / null / NaN become null", () => {
  assert.equal(usableRate(0), null);
  assert.equal(usableRate(null), null);
  assert.equal(usableRate("abc"), null);
  assert.equal(usableRate(-5), null);
  assert.equal(usableRate(285), 285);
  assert.equal(usableRate("199.5"), 199.5);
});

// ── Totals: no false ₹0, live recalculation (§11/§76 F–I) ──────────────

test("computeQuotationTotals: a rate-pending line makes pricing incomplete, not ₹0", () => {
  const result = computeQuotationTotals([{ lineType: "PRODUCT", quantity: 250, description: "Uniform" }]);
  assert.equal(result.pricingComplete, false);
  assert.equal(result.linesNeedingRate, 1);
  assert.equal(result.lines[0].lineTotal, null); // NOT 0
  assert.equal(result.subtotal, 0); // the known lines sum to 0, but pricingComplete flags it
});

test("computeQuotationTotals: entering a rate recalculates the total (§76 F)", () => {
  const before = computeQuotationTotals([{ lineType: "PRODUCT", quantity: 250, description: "Uniform" }]);
  assert.equal(before.pricingComplete, false);
  const after = computeQuotationTotals([{ lineType: "PRODUCT", quantity: 250, unitPrice: 215, description: "Uniform" }]);
  assert.equal(after.pricingComplete, true);
  assert.equal(after.grandTotal, 53750);
});

test("computeQuotationTotals: changing quantity recalculates (§76 G)", () => {
  const q250 = computeQuotationTotals([{ lineType: "PRODUCT", quantity: 250, unitPrice: 215 }]);
  const q300 = computeQuotationTotals([{ lineType: "PRODUCT", quantity: 300, unitPrice: 215 }]);
  assert.equal(q250.grandTotal, 53750);
  assert.equal(q300.grandTotal, 64500);
});

test("computeQuotationTotals: adding and removing a product recalculates (§76 H/I)", () => {
  const one = computeQuotationTotals([{ lineType: "PRODUCT", quantity: 300, unitPrice: 215 }]);
  const two = computeQuotationTotals([
    { lineType: "PRODUCT", quantity: 300, unitPrice: 215 },
    { lineType: "PRODUCT", quantity: 100, unitPrice: 130 },
  ]);
  assert.equal(one.grandTotal, 64500);
  assert.equal(two.grandTotal, 77500); // + 13000
  const removed = computeQuotationTotals([{ lineType: "PRODUCT", quantity: 100, unitPrice: 130 }]);
  assert.equal(removed.grandTotal, 13000);
});

test("computeQuotationTotals: shipping adds, discount subtracts, negotiated example", () => {
  const result = computeQuotationTotals(
    [
      { lineType: "PRODUCT", quantity: 300, unitPrice: 215 },
      { lineType: "PRODUCT", quantity: 100, unitPrice: 130 },
      { lineType: "SHIPPING", description: "Delivery", lineTotal: 1500 },
      { lineType: "DISCOUNT", description: "Volume", lineTotal: -2000 },
    ],
    undefined,
  );
  assert.equal(result.subtotal, 79000);
  assert.equal(result.grandTotal, 77000);
  assert.equal(result.pricingComplete, true);
});

test("lineNeedsRate: only PRODUCT/SHIPPING with a quantity and no price/amount", () => {
  assert.equal(lineNeedsRate({ lineType: "PRODUCT", quantity: 10 }), true);
  assert.equal(lineNeedsRate({ lineType: "PRODUCT", quantity: 10, unitPrice: 5 }), false);
  assert.equal(lineNeedsRate({ lineType: "PRODUCT", quantity: 10, lineTotal: 50 }), false);
  assert.equal(lineNeedsRate({ lineType: "SHIPPING", quantity: 1 }), true);
  assert.equal(lineNeedsRate({ lineType: "DISCOUNT", lineTotal: -5 }), false);
});

// ── Send validation (§12/§76 E) ───────────────────────────────────────

test("quotationSendBlockers: blocks a quotation with no lines", () => {
  const blockers = quotationSendBlockers({ lines: [], validUntil: new Date(), grandTotal: 0 });
  assert.ok(blockers.some((b) => /at least one/i.test(b)));
});

test("quotationSendBlockers: blocks while a line still needs a rate (§76 E)", () => {
  const blockers = quotationSendBlockers({
    lines: [{ lineType: "PRODUCT", quantity: 250, unitPrice: null, lineTotal: null }],
    validUntil: new Date(),
    grandTotal: 0,
  });
  assert.ok(blockers.some((b) => /needs? a rate/i.test(b)));
});

test("quotationSendBlockers: blocks when validUntil is missing", () => {
  const blockers = quotationSendBlockers({
    lines: [{ lineType: "PRODUCT", quantity: 10, unitPrice: 5, lineTotal: 50 }],
    validUntil: null,
    grandTotal: 50,
  });
  assert.ok(blockers.some((b) => /valid-until/i.test(b)));
});

test("quotationSendBlockers: a fully priced quotation with a date and a positive total is sendable", () => {
  const blockers = quotationSendBlockers({
    lines: [
      { lineType: "PRODUCT", quantity: 300, unitPrice: 215, lineTotal: 64500 },
      { lineType: "SHIPPING", quantity: null, unitPrice: null, lineTotal: 1500 },
    ],
    validUntil: new Date(),
    grandTotal: 66000,
  });
  assert.deepEqual(blockers, []);
});

// ── Revision clone (§20/§76 P) ────────────────────────────────────────

test("buildLinesFromQuotation: clones every line with quantity, rate and frozen codes", () => {
  const previous = {
    lines: [
      { sortOrder: 0, lineType: "PRODUCT", description: "Uniform", productId: "p1", productNameSnapshot: "Uniform", productCodeSnapshot: "PL-UN-001", quantity: 300, unit: "piece", unitPrice: 215, lineTotal: 64500 },
      { sortOrder: 1, lineType: "SHIPPING", description: "Delivery", quantity: null, unit: null, unitPrice: null, lineTotal: 1500 },
      { sortOrder: 2, lineType: "DISCOUNT", description: "Volume", quantity: null, unit: null, unitPrice: null, lineTotal: -2000 },
    ],
  };
  const cloned = buildLinesFromQuotation(previous);
  assert.equal(cloned.length, 3);
  assert.equal(cloned[0].quantity, 300);
  assert.equal(cloned[0].unitPrice, 215);
  assert.equal(cloned[0].productCode, "PL-UN-001");
  assert.equal(cloned[1].lineTotal, 1500);
  assert.equal(cloned[2].lineTotal, -2000);
  // recomputing the clone reproduces the same total → V2 starts identical to V1
  const totals = computeQuotationTotals(cloned);
  assert.equal(totals.grandTotal, 64000);
});
