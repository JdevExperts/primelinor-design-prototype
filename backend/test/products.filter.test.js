const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildWhere,
  applyPriceRange,
  sortProducts,
  categoryMembershipSortOrder,
  mergeRelatedProducts,
} = require("../src/controllers/products.controller");

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
  assert.equal(where.categories.some.category.slug, "tshirts");
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

test("categoryMembershipSortOrder: finds the sortOrder for the matching category membership", () => {
  const product = {
    categories: [
      { sortOrder: 5, category: { slug: "promotional" } },
      { sortOrder: 0, category: { slug: "tshirts" } },
    ],
  };
  assert.equal(categoryMembershipSortOrder(product, "promotional"), 5);
  assert.equal(categoryMembershipSortOrder(product, "tshirts"), 0);
});

test("categoryMembershipSortOrder: null when no categorySlug given, or product has no matching membership", () => {
  const product = { categories: [{ sortOrder: 0, category: { slug: "tshirts" } }] };
  assert.equal(categoryMembershipSortOrder(product, undefined), null);
  assert.equal(categoryMembershipSortOrder(product, "polo"), null);
});

test("sortProducts: recommended + a category filter orders by THAT category's ProductCategory.sortOrder, not global Product.sortOrder", () => {
  const products = [
    { name: "Kit", sortOrder: 9, categories: [{ sortOrder: 0, category: { slug: "promotional" } }] },
    { name: "Cap", sortOrder: 1, categories: [{ sortOrder: 1, category: { slug: "promotional" } }] },
    { name: "Pen", sortOrder: 5, categories: [{ sortOrder: 2, category: { slug: "promotional" } }] },
  ];
  const sorted = sortProducts(products, "recommended", "promotional");
  assert.deepEqual(sorted.map((p) => p.name), ["Kit", "Cap", "Pen"]);
});

test("sortProducts: recommended with NO category filter keeps using global Product.sortOrder, unaffected by any ProductCategory.sortOrder", () => {
  const products = [
    { name: "Kit", sortOrder: 9, categories: [{ sortOrder: 0, category: { slug: "promotional" } }] },
    { name: "Cap", sortOrder: 1, categories: [{ sortOrder: 1, category: { slug: "promotional" } }] },
  ];
  const sorted = sortProducts(products, "recommended");
  assert.deepEqual(sorted.map((p) => p.name), ["Cap", "Kit"]);
});

test("sortProducts: an explicit sort (price_asc) ignores category-specific sortOrder — it stays a literal, category-independent order", () => {
  const products = [
    { name: "A", fixedPrice: 200, priceMode: "FIXED", categories: [{ sortOrder: 9, category: { slug: "promotional" } }] },
    { name: "B", fixedPrice: 100, priceMode: "FIXED", categories: [{ sortOrder: 0, category: { slug: "promotional" } }] },
  ];
  const sorted = sortProducts(products, "price_asc", "promotional");
  assert.deepEqual(sorted.map((p) => p.name), ["B", "A"]);
});

test("mergeRelatedProducts: explicit curated relations always come first, in their given order", () => {
  const result = mergeRelatedProducts({
    explicit: [{ id: "b" }, { id: "a" }],
    samePrimaryCategory: [{ id: "c" }],
    sharedSecondaryCategory: [{ id: "d" }],
  });
  assert.deepEqual(result.map((p) => p.id), ["b", "a", "c", "d"]);
});

test("mergeRelatedProducts: fills remaining slots from same-primary-category before shared-secondary-category", () => {
  const result = mergeRelatedProducts({
    explicit: [],
    samePrimaryCategory: [{ id: "same-cat-1" }, { id: "same-cat-2" }],
    sharedSecondaryCategory: [{ id: "shared-secondary-1" }],
  });
  assert.deepEqual(result.map((p) => p.id), ["same-cat-1", "same-cat-2", "shared-secondary-1"]);
});

test("mergeRelatedProducts: dedupes by id across pools, keeping only the first (highest-priority) occurrence", () => {
  const result = mergeRelatedProducts({
    explicit: [{ id: "x" }],
    samePrimaryCategory: [{ id: "x" }, { id: "y" }],
    sharedSecondaryCategory: [{ id: "y" }, { id: "z" }],
  });
  assert.deepEqual(result.map((p) => p.id), ["x", "y", "z"]);
});

test("mergeRelatedProducts: caps at the given limit without ever exceeding it", () => {
  const result = mergeRelatedProducts(
    {
      explicit: [{ id: "1" }, { id: "2" }],
      samePrimaryCategory: [{ id: "3" }, { id: "4" }, { id: "5" }],
      sharedSecondaryCategory: [{ id: "6" }, { id: "7" }],
    },
    3,
  );
  assert.deepEqual(result.map((p) => p.id), ["1", "2", "3"]);
});

test("mergeRelatedProducts: 0 candidates across every pool yields an empty list, not an error", () => {
  const result = mergeRelatedProducts({ explicit: [], samePrimaryCategory: [], sharedSecondaryCategory: [] });
  assert.deepEqual(result, []);
});

test("mergeRelatedProducts: defaults to a limit of 8", () => {
  const explicit = Array.from({ length: 10 }, (_, i) => ({ id: `p${i}` }));
  const result = mergeRelatedProducts({ explicit, samePrimaryCategory: [], sharedSecondaryCategory: [] });
  assert.equal(result.length, 8);
});
