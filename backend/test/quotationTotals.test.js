const test = require("node:test");
const assert = require("node:assert/strict");
const { computeLineTotal, computeQuotationTotals } = require("../src/services/quotationTotals");

test("computeLineTotal: PRODUCT with quantity+unitPrice is computed, not trusted from input", () => {
  const line = { lineType: "PRODUCT", quantity: 5, unitPrice: 149, lineTotal: 1 };
  assert.equal(computeLineTotal(line), 745);
});

test("computeLineTotal: SHIPPING with no quantity/unitPrice keeps the manual lineTotal", () => {
  const line = { lineType: "SHIPPING", description: "Flat delivery", lineTotal: 150 };
  assert.equal(computeLineTotal(line), 150);
});

test("computeLineTotal: DISCOUNT always keeps its manual (negative) lineTotal", () => {
  const line = { lineType: "DISCOUNT", lineTotal: -50 };
  assert.equal(computeLineTotal(line), -50);
});

test("computeQuotationTotals: subtotal is PRODUCT+SHIPPING only, adjustments and tax apply on top", () => {
  const lines = [
    { lineType: "PRODUCT", quantity: 5, unitPrice: 149 }, // 745
    { lineType: "SHIPPING", lineTotal: 150 },
    { lineType: "DISCOUNT", lineTotal: -50 },
    { lineType: "ADJUSTMENT", lineTotal: 25 },
  ];
  const result = computeQuotationTotals(lines, 40.5);
  assert.equal(result.subtotal, 895); // 745 + 150
  // grandTotal = subtotal + adjustments(-50 + 25) + tax(40.5) = 895 - 25 + 40.5
  assert.equal(result.grandTotal, 910.5);
});

test("computeQuotationTotals: no tax defaults to 0, not null propagation", () => {
  const lines = [{ lineType: "PRODUCT", quantity: 2, unitPrice: 100 }];
  const result = computeQuotationTotals(lines, undefined);
  assert.equal(result.subtotal, 200);
  assert.equal(result.grandTotal, 200);
});

test("computeQuotationTotals: rounds to 2 decimal places", () => {
  const lines = [{ lineType: "PRODUCT", quantity: 3, unitPrice: 33.333 }];
  const result = computeQuotationTotals(lines);
  assert.equal(result.subtotal, 100); // 3 * 33.333 = 99.999 -> rounds to 100.00
});

test("computeQuotationTotals: empty line list totals to zero", () => {
  const result = computeQuotationTotals([]);
  assert.equal(result.subtotal, 0);
  assert.equal(result.grandTotal, 0);
});
