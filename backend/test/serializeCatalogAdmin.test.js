const test = require("node:test");
const assert = require("node:assert/strict");
const { serializeProductAdminSummary, serializeProductAdminDetail } = require("../src/services/serializeCatalogAdmin");

test("serializeProductAdminSummary: priceSummary is 'Quote Only' for QUOTE_ONLY", () => {
  const product = { priceMode: "QUOTE_ONLY", priceTiers: [], assets: [] };
  assert.equal(serializeProductAdminSummary(product).priceSummary, "Quote Only");
});

test("serializeProductAdminSummary: priceSummary is a single value for FIXED", () => {
  const product = { priceMode: "FIXED", fixedPrice: 349, priceTiers: [], assets: [] };
  assert.equal(serializeProductAdminSummary(product).priceSummary, "₹349");
});

test("serializeProductAdminSummary: priceSummary is an entry-to-cheapest range for TIERED", () => {
  const product = {
    priceMode: "TIERED",
    priceTiers: [
      { minQty: 10, maxQty: 49, unitPrice: 349 },
      { minQty: 50, maxQty: 499, unitPrice: 329 },
      { minQty: 500, maxQty: null, unitPrice: 299 },
    ],
    assets: [],
  };
  assert.equal(serializeProductAdminSummary(product).priceSummary, "₹349–₹299");
});

test("serializeProductAdminSummary: thumbnail is the first (sortOrder-earliest) included asset, or null", () => {
  const withAsset = serializeProductAdminSummary({
    priceMode: "FIXED",
    fixedPrice: 100,
    priceTiers: [],
    assets: [{ url: "https://example.com/a.png", alt: "Front" }],
  });
  assert.deepEqual(withAsset.thumbnail, { url: "https://example.com/a.png", alt: "Front" });

  const withoutAsset = serializeProductAdminSummary({ priceMode: "FIXED", fixedPrice: 100, priceTiers: [], assets: [] });
  assert.equal(withoutAsset.thumbnail, null);
});

test("serializeProductAdminDetail: customizationIncomplete is false when not customizable", () => {
  const product = { customizable: false, assets: [], placementZones: [], priceMode: "QUOTE_ONLY", priceTiers: [] };
  assert.equal(serializeProductAdminDetail(product).customizationIncomplete, false);
});

test("serializeProductAdminDetail: customizationIncomplete is true when customizable but missing assets/zones", () => {
  const product = { customizable: true, assets: [], placementZones: [], priceMode: "QUOTE_ONLY", priceTiers: [] };
  assert.equal(serializeProductAdminDetail(product).customizationIncomplete, true);
});

test("serializeProductAdminDetail: customizationIncomplete is true when a customization asset exists but no active zone", () => {
  const product = {
    customizable: true,
    assets: [{ type: "CUSTOMIZATION_FRONT", active: true }],
    placementZones: [],
    priceMode: "QUOTE_ONLY",
    priceTiers: [],
  };
  assert.equal(serializeProductAdminDetail(product).customizationIncomplete, true);
});

test("serializeProductAdminDetail: customizationIncomplete is false once a customization asset and an active zone both exist", () => {
  const product = {
    customizable: true,
    assets: [{ type: "CUSTOMIZATION_FRONT", active: true }],
    placementZones: [{ active: true }],
    priceMode: "QUOTE_ONLY",
    priceTiers: [],
  };
  assert.equal(serializeProductAdminDetail(product).customizationIncomplete, false);
});
