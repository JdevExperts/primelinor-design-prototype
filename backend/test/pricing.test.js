const test = require("node:test");
const assert = require("node:assert/strict");
const { effectivePrice, compareByEffectivePrice } = require("../src/services/pricing");

test("effectivePrice: FIXED returns fixedPrice", () => {
  assert.equal(effectivePrice({ priceMode: "FIXED", fixedPrice: 449 }), 449);
});

test("effectivePrice: FIXED with no fixedPrice returns null", () => {
  assert.equal(effectivePrice({ priceMode: "FIXED", fixedPrice: null }), null);
});

test("effectivePrice: TIERED returns the entry (lowest minQty) tier's price, not the numerically lowest", () => {
  const product = {
    priceMode: "TIERED",
    priceTiers: [
      { minQty: 500, maxQty: 4999, unitPrice: 139 },
      { minQty: 5, maxQty: 49, unitPrice: 149 },
      { minQty: 50, maxQty: 499, unitPrice: 145 },
    ],
  };
  // Entry price is 149 (the MOQ tier), even though 139 is numerically lower.
  assert.equal(effectivePrice(product), 149);
});

test("effectivePrice: TIERED with no tiers returns null", () => {
  assert.equal(effectivePrice({ priceMode: "TIERED", priceTiers: [] }), null);
});

test("effectivePrice: QUOTE_ONLY always returns null", () => {
  assert.equal(effectivePrice({ priceMode: "QUOTE_ONLY" }), null);
});

test("compareByEffectivePrice: quote-only products always sort last regardless of direction", () => {
  const priced = { priceMode: "FIXED", fixedPrice: 100 };
  const quoteOnly = { priceMode: "QUOTE_ONLY" };

  assert.ok(compareByEffectivePrice(priced, quoteOnly, "asc") < 0);
  assert.ok(compareByEffectivePrice(quoteOnly, priced, "asc") > 0);
  assert.ok(compareByEffectivePrice(priced, quoteOnly, "desc") < 0);
  assert.ok(compareByEffectivePrice(quoteOnly, priced, "desc") > 0);
});
