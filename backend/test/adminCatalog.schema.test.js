const test = require("node:test");
const assert = require("node:assert/strict");
const {
  categorySchema,
  colorSchema,
  createProductSchema,
  placementZoneSchema,
} = require("../src/validation/adminCatalog.schema");

const BASE_PRODUCT = {
  name: "Test Product",
  slug: "test-product",
  primaryCategoryId: "11111111-1111-4111-8111-111111111111",
  categoryIds: ["11111111-1111-4111-8111-111111111111"],
  description: "A test product.",
  moq: 10,
  unit: "piece",
};

test("categorySchema: rejects an invalid slug", () => {
  const result = categorySchema.safeParse({ name: "Bad", slug: "Not A Slug!" });
  assert.equal(result.success, false);
});

test("categorySchema: accepts a valid category", () => {
  const result = categorySchema.safeParse({ name: "Apparel", slug: "apparel", sortOrder: 1 });
  assert.equal(result.success, true);
});

test("colorSchema: rejects a malformed hex value", () => {
  const result = colorSchema.safeParse({ name: "Navy", slug: "navy", hex: "blue" });
  assert.equal(result.success, false);
});

test("colorSchema: accepts a valid 6-digit hex", () => {
  const result = colorSchema.safeParse({ name: "Navy", slug: "navy", hex: "#22304A" });
  assert.equal(result.success, true);
});

test("createProductSchema: rejects an empty categoryIds array", () => {
  const result = createProductSchema.safeParse({ ...BASE_PRODUCT, categoryIds: [], priceMode: "QUOTE_ONLY" });
  assert.equal(result.success, false);
});

test("createProductSchema: rejects primaryCategoryId not present in categoryIds", () => {
  const result = createProductSchema.safeParse({
    ...BASE_PRODUCT,
    primaryCategoryId: "22222222-2222-4222-8222-222222222222",
    categoryIds: ["11111111-1111-4111-8111-111111111111"],
    priceMode: "QUOTE_ONLY",
  });
  assert.equal(result.success, false);
});

test("createProductSchema: accepts primaryCategoryId among multiple categoryIds", () => {
  const result = createProductSchema.safeParse({
    ...BASE_PRODUCT,
    primaryCategoryId: "11111111-1111-4111-8111-111111111111",
    categoryIds: ["11111111-1111-4111-8111-111111111111", "22222222-2222-4222-8222-222222222222"],
    priceMode: "QUOTE_ONLY",
  });
  assert.equal(result.success, true);
});

test("createProductSchema: FIXED pricing requires fixedPrice", () => {
  const result = createProductSchema.safeParse({ ...BASE_PRODUCT, priceMode: "FIXED" });
  assert.equal(result.success, false);
});

test("createProductSchema: FIXED pricing accepted with fixedPrice", () => {
  const result = createProductSchema.safeParse({ ...BASE_PRODUCT, priceMode: "FIXED", fixedPrice: 349 });
  assert.equal(result.success, true);
});

test("createProductSchema: TIERED pricing requires at least one tier", () => {
  const result = createProductSchema.safeParse({ ...BASE_PRODUCT, priceMode: "TIERED", priceTiers: [] });
  assert.equal(result.success, false);
});

test("createProductSchema: QUOTE_ONLY needs no price fields at all", () => {
  const result = createProductSchema.safeParse({ ...BASE_PRODUCT, priceMode: "QUOTE_ONLY" });
  assert.equal(result.success, true);
});

test("createProductSchema: rejects overlapping tiers", () => {
  const result = createProductSchema.safeParse({
    ...BASE_PRODUCT,
    priceMode: "TIERED",
    priceTiers: [
      { minQty: 10, maxQty: 100, unitPrice: 10 },
      { minQty: 50, maxQty: 200, unitPrice: 9 },
    ],
  });
  assert.equal(result.success, false);
});

test("createProductSchema: rejects a non-final open-ended tier", () => {
  const result = createProductSchema.safeParse({
    ...BASE_PRODUCT,
    priceMode: "TIERED",
    priceTiers: [
      { minQty: 10, unitPrice: 10 },
      { minQty: 100, maxQty: 500, unitPrice: 9 },
    ],
  });
  assert.equal(result.success, false);
});

test("createProductSchema: accepts clean, non-overlapping, ascending tiers", () => {
  const result = createProductSchema.safeParse({
    ...BASE_PRODUCT,
    priceMode: "TIERED",
    priceTiers: [
      { minQty: 10, maxQty: 49, unitPrice: 349 },
      { minQty: 50, maxQty: 499, unitPrice: 329 },
      { minQty: 500, unitPrice: 299 },
    ],
  });
  assert.equal(result.success, true);
});

test("createProductSchema: quoteAboveQty is rejected on a non-TIERED product", () => {
  const result = createProductSchema.safeParse({ ...BASE_PRODUCT, priceMode: "FIXED", fixedPrice: 100, quoteAboveQty: 500 });
  assert.equal(result.success, false);
});

test("createProductSchema: quoteAboveQty must sit at/after the end of tier coverage", () => {
  const result = createProductSchema.safeParse({
    ...BASE_PRODUCT,
    priceMode: "TIERED",
    priceTiers: [{ minQty: 10, maxQty: 4999, unitPrice: 299 }],
    quoteAboveQty: 100, // inside covered range — invalid
  });
  assert.equal(result.success, false);
});

test("createProductSchema: accepts a valid quote-above-quantity extension (priced up to 4999, 5000+ quote-only)", () => {
  const result = createProductSchema.safeParse({
    ...BASE_PRODUCT,
    priceMode: "TIERED",
    priceTiers: [{ minQty: 10, maxQty: 4999, unitPrice: 299 }],
    quoteAboveQty: 5000,
  });
  assert.equal(result.success, true);
});

test("createProductSchema: quoteAboveQty is rejected when the last tier is already open-ended", () => {
  const result = createProductSchema.safeParse({
    ...BASE_PRODUCT,
    priceMode: "TIERED",
    priceTiers: [{ minQty: 10, unitPrice: 299 }],
    quoteAboveQty: 5000,
  });
  assert.equal(result.success, false);
});

test("placementZoneSchema: rejects out-of-range normalized coordinates", () => {
  const result = placementZoneSchema.safeParse({
    view: "FRONT",
    placementKey: "front-left-chest",
    label: "Left Chest",
    cx: 150,
    cy: 25,
    width: 15,
    height: 15,
  });
  assert.equal(result.success, false);
});

test("placementZoneSchema: rejects a zero-width zone", () => {
  const result = placementZoneSchema.safeParse({
    view: "FRONT",
    placementKey: "front-left-chest",
    label: "Left Chest",
    cx: 30,
    cy: 25,
    width: 0,
    height: 15,
  });
  assert.equal(result.success, false);
});

test("placementZoneSchema: rejects a placementKey that isn't a stable slug-like key", () => {
  const result = placementZoneSchema.safeParse({
    view: "FRONT",
    placementKey: "Left Chest",
    label: "Left Chest",
    cx: 30,
    cy: 25,
    width: 15,
    height: 15,
  });
  assert.equal(result.success, false);
});

test("placementZoneSchema: accepts a valid normalized zone", () => {
  const result = placementZoneSchema.safeParse({
    view: "BACK",
    placementKey: "back-center",
    label: "Center Back",
    cx: 50,
    cy: 40,
    width: 20,
    height: 20,
  });
  assert.equal(result.success, true);
});
