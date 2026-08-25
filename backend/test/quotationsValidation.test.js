const test = require("node:test");
const assert = require("node:assert/strict");
const { quotationLineSchema, createQuotationSchema } = require("../src/validation/quotations.schema");

test("quotationLineSchema: accepts a PRODUCT line with quantity+unitPrice", () => {
  const result = quotationLineSchema.parse({
    lineType: "PRODUCT",
    description: "T-shirt",
    quantity: 5,
    unitPrice: 149,
  });
  assert.equal(result.quantity, 5);
});

test("quotationLineSchema: accepts a flat SHIPPING line with just lineTotal", () => {
  const result = quotationLineSchema.parse({ lineType: "SHIPPING", description: "Delivery", lineTotal: 150 });
  assert.equal(result.lineTotal, 150);
});

test("quotationLineSchema: rejects a line with neither quantity+unitPrice nor lineTotal", () => {
  assert.throws(() => quotationLineSchema.parse({ lineType: "PRODUCT", description: "Nothing to price" }));
});

test("quotationLineSchema: rejects a positive DISCOUNT amount", () => {
  assert.throws(() => quotationLineSchema.parse({ lineType: "DISCOUNT", description: "bad", lineTotal: 50 }));
});

test("quotationLineSchema: accepts a zero or negative DISCOUNT amount", () => {
  assert.doesNotThrow(() => quotationLineSchema.parse({ lineType: "DISCOUNT", description: "ok", lineTotal: -50 }));
  assert.doesNotThrow(() => quotationLineSchema.parse({ lineType: "DISCOUNT", description: "ok", lineTotal: 0 }));
});

test("quotationLineSchema: a DISCOUNT computed from quantity*unitPrice must also be <= 0", () => {
  assert.throws(() =>
    quotationLineSchema.parse({ lineType: "DISCOUNT", description: "bad", quantity: 2, unitPrice: 10 }),
  );
});

test("createQuotationSchema: rejects unknown top-level keys", () => {
  assert.throws(() => createQuotationSchema.parse({ lines: [], grandTotal: 999 }));
});

test("createQuotationSchema: lines default to an empty array", () => {
  const result = createQuotationSchema.parse({});
  assert.deepEqual(result.lines, []);
});
