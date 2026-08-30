const test = require("node:test");
const assert = require("node:assert/strict");
const {
  serializeProductAdminSummary,
  serializeProductAdminDetail,
  serializeCategoryAdmin,
} = require("../src/services/serializeCatalogAdmin");

test("serializeCategoryAdmin: image is null when the category has no imageUrl", () => {
  const category = { id: "c1", name: "Bags", slug: "bags", parentCategoryId: null, active: true, sortOrder: 1, imageUrl: null, imageStorageKey: null, imageAlt: null };
  assert.equal(serializeCategoryAdmin(category).image, null);
});

test("serializeCategoryAdmin: image is {url, alt} when set, and never exposes imageStorageKey", () => {
  const category = {
    id: "c1",
    name: "Bags",
    slug: "bags",
    parentCategoryId: null,
    active: true,
    sortOrder: 1,
    imageUrl: "https://bucket.s3.amazonaws.com/categories/c1/bags.png",
    imageStorageKey: "categories/c1/bags.png",
    imageAlt: "Bags",
  };
  const result = serializeCategoryAdmin(category);
  assert.deepEqual(result.image, { url: "https://bucket.s3.amazonaws.com/categories/c1/bags.png", alt: "Bags" });
  assert.equal("imageStorageKey" in result, false);
  assert.equal(JSON.stringify(result).includes("imageStorageKey"), false);
});

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

test("serializeProductAdminSummary: exposes variantType/activeVariantCount/specificationCount from _count, defaulting to 0 when _count is absent", () => {
  const withCounts = serializeProductAdminSummary({
    priceMode: "QUOTE_ONLY",
    priceTiers: [],
    assets: [],
    variantType: "size",
    _count: { variants: 5, specifications: 2 },
  });
  assert.equal(withCounts.variantType, "size");
  assert.equal(withCounts.activeVariantCount, 5);
  assert.equal(withCounts.specificationCount, 2);

  const withoutCounts = serializeProductAdminSummary({ priceMode: "QUOTE_ONLY", priceTiers: [], assets: [] });
  assert.equal(withoutCounts.activeVariantCount, 0);
  assert.equal(withoutCounts.specificationCount, 0);
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

test("serializeProductAdminDetail: customizationIncomplete is false once a CUSTOMIZATION_FRONT asset and an active FRONT zone both exist", () => {
  const product = {
    customizable: true,
    assets: [{ type: "CUSTOMIZATION_FRONT", active: true }],
    placementZones: [{ active: true, view: "FRONT" }],
    priceMode: "QUOTE_ONLY",
    priceTiers: [],
  };
  assert.equal(serializeProductAdminDetail(product).customizationIncomplete, false);
});

test("serializeProductAdminDetail: a BACK-only asset+zone does NOT suppress the warning — matches the public studioReady rule, which requires FRONT specifically (Product Data Completeness §13)", () => {
  const product = {
    customizable: true,
    assets: [{ type: "CUSTOMIZATION_BACK", active: true }],
    placementZones: [{ active: true, view: "BACK" }],
    priceMode: "QUOTE_ONLY",
    priceTiers: [],
  };
  assert.equal(serializeProductAdminDetail(product).customizationIncomplete, true);
});

test("serializeProductAdminDetail: an inactive CUSTOMIZATION_FRONT asset does not count — Admin's include is unfiltered, so active-ness must still be checked", () => {
  const product = {
    customizable: true,
    assets: [{ type: "CUSTOMIZATION_FRONT", active: false }],
    placementZones: [{ active: true, view: "FRONT" }],
    priceMode: "QUOTE_ONLY",
    priceTiers: [],
  };
  assert.equal(serializeProductAdminDetail(product).customizationIncomplete, true);
});
