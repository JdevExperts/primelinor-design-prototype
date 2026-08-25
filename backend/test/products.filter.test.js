const test = require("node:test");
const assert = require("node:assert/strict");
const { buildWhere, applyPriceRange, sortProducts } = require("../src/controllers/products.controller");

test("buildWhere: always scopes to active products", () => {
  assert.deepEqual(buildWhere({}), { active: true });
});

test("buildWhere: maps category/material/customizable/color", () => {
  const where = buildWhere({
    category: "tshirts",
    material: "cotton",
    customizable: true,
    color: "navy",
  });
  assert.equal(where.category.slug, "tshirts");
  assert.equal(where.material.equals, "cotton");
  assert.equal(where.customizable, true);
  assert.equal(where.colors.some.color.slug, "navy");
});

test("buildWhere: gsm/moq become gte/lte range clauses", () => {
  const where = buildWhere({ minGsm: 160, maxGsm: 240, minMoq: 10 });
  assert.deepEqual(where.gsm, { gte: 160, lte: 240 });
  assert.deepEqual(where.moq, { gte: 10 });
});

test("applyPriceRange: excludes quote-only products from a price-range filter", () => {
  const products = [
    { priceMode: "FIXED", fixedPrice: 100 },
    { priceMode: "QUOTE_ONLY" },
  ];
  const result = applyPriceRange(products, { minPrice: 0, maxPrice: 1000 });
  assert.equal(result.length, 1);
  assert.equal(result[0].priceMode, "FIXED");
});

test("applyPriceRange: no-op when neither bound is set", () => {
  const products = [{ priceMode: "QUOTE_ONLY" }];
  assert.equal(applyPriceRange(products, {}), products);
});

test("sortProducts: price_asc never silently no-ops (regression test for the old backend's bug)", () => {
  const products = [
    { name: "B", priceMode: "FIXED", fixedPrice: 300 },
    { name: "A", priceMode: "FIXED", fixedPrice: 100 },
    { name: "C", priceMode: "FIXED", fixedPrice: 200 },
  ];
  const sorted = sortProducts(products, "price_asc");
  assert.deepEqual(
    sorted.map((p) => p.fixedPrice),
    [100, 200, 300],
  );
});

test("sortProducts: moq_asc sorts ascending by moq", () => {
  const products = [
    { name: "B", moq: 50 },
    { name: "A", moq: 5 },
  ];
  const sorted = sortProducts(products, "moq_asc");
  assert.deepEqual(sorted.map((p) => p.moq), [5, 50]);
});

test("sortProducts: recommended falls back to sortOrder then name", () => {
  const products = [
    { name: "Z", sortOrder: 1 },
    { name: "A", sortOrder: 1 },
  ];
  const sorted = sortProducts(products, "recommended");
  assert.deepEqual(sorted.map((p) => p.name), ["A", "Z"]);
});
