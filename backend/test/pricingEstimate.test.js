const test = require("node:test");
const assert = require("node:assert/strict");
const { computeEstimateForQuantity, findTier } = require("../src/services/pricingEstimate");

const tieredProduct = {
  priceMode: "TIERED",
  priceTiers: [
    { minQty: 5, maxQty: 49, unitPrice: 149 },
    { minQty: 50, maxQty: 499, unitPrice: 145 },
    { minQty: 500, maxQty: null, unitPrice: 139 },
  ],
};

test("computeEstimateForQuantity: TIERED picks the matching band", () => {
  assert.deepEqual(computeEstimateForQuantity(tieredProduct, 10), { unitPrice: 149, total: 1490 });
  assert.deepEqual(computeEstimateForQuantity(tieredProduct, 250), { unitPrice: 145, total: 36250 });
  assert.deepEqual(computeEstimateForQuantity(tieredProduct, 1000), { unitPrice: 139, total: 139000 });
});

test("computeEstimateForQuantity: TIERED below every tier's minQty is price-on-request", () => {
  assert.deepEqual(computeEstimateForQuantity(tieredProduct, 1), { unitPrice: null, total: null });
});

test("computeEstimateForQuantity: FIXED multiplies unit price by quantity", () => {
  const product = { priceMode: "FIXED", fixedPrice: 449 };
  assert.deepEqual(computeEstimateForQuantity(product, 20), { unitPrice: 449, total: 8980 });
});

test("computeEstimateForQuantity: FIXED with no fixedPrice is price-on-request", () => {
  const product = { priceMode: "FIXED", fixedPrice: null };
  assert.deepEqual(computeEstimateForQuantity(product, 20), { unitPrice: null, total: null });
});

test("computeEstimateForQuantity: QUOTE_ONLY is always price-on-request", () => {
  const product = { priceMode: "QUOTE_ONLY" };
  assert.deepEqual(computeEstimateForQuantity(product, 100), { unitPrice: null, total: null });
});

test("findTier: boundary at maxQty is inclusive", () => {
  assert.equal(findTier(tieredProduct, 49).unitPrice, 149);
  assert.equal(findTier(tieredProduct, 50).unitPrice, 145);
});

test("findTier: an open-ended top tier (maxQty null) matches any quantity above minQty", () => {
  assert.equal(findTier(tieredProduct, 5_000_000).unitPrice, 139);
});
