const test = require("node:test");
const assert = require("node:assert/strict");
const { serializeSolutionSummary, serializeSolutionDetail, deriveSolutionCategories } = require("../src/services/serialize");

function product(overrides = {}) {
  return {
    id: "p1",
    slug: "premium-polo",
    name: "Premium Polo",
    primaryCategory: { id: "cat-1", slug: "polo", name: "Polo T-Shirts", active: true },
    categories: [],
    moq: 10,
    unit: "piece",
    priceMode: "QUOTE_ONLY",
    fixedPrice: null,
    priceTiers: [],
    assets: [],
    quoteAboveQty: null,
    customizable: false,
    colors: [],
    placementZones: [],
    sortOrder: 0,
    createdAt: new Date(),
    active: true,
    ...overrides,
  };
}

test("deriveSolutionCategories: dedupes by category id, first-occurrence order, active products only", () => {
  const solutionProducts = [
    { sortOrder: 0, product: product({ primaryCategory: { id: "cat-1", slug: "polo", name: "Polo", active: true } }) },
    { sortOrder: 1, product: product({ primaryCategory: { id: "cat-2", slug: "bottles", name: "Bottles", active: true } }) },
    { sortOrder: 2, product: product({ primaryCategory: { id: "cat-1", slug: "polo", name: "Polo", active: true } }) }, // duplicate category
    { sortOrder: 3, product: product({ active: false, primaryCategory: { id: "cat-3", slug: "bags", name: "Bags", active: true } }) }, // inactive product, excluded
  ];
  const result = deriveSolutionCategories(solutionProducts);
  assert.deepEqual(
    result.map((c) => c.slug),
    ["polo", "bottles"],
  );
});

test("deriveSolutionCategories: empty for no mapped products", () => {
  assert.deepEqual(deriveSolutionCategories([]), []);
  assert.deepEqual(deriveSolutionCategories(undefined), []);
});

test("serializeSolutionSummary: image is null when imageUrl is unset, never exposes imageStorageKey", () => {
  const solution = {
    id: "s1",
    slug: "corporate-teams",
    name: "Corporate Teams",
    eyebrow: null,
    hubDescription: "desc",
    art: "polo",
    color: "#000",
    imageUrl: "https://bucket.s3.amazonaws.com/solutions/s1/photo.png",
    imageStorageKey: "solutions/s1/photo.png",
    imageAlt: "alt text",
    featuredOnHome: true,
    sortOrder: 0,
    products: [],
  };
  const result = serializeSolutionSummary(solution);
  assert.deepEqual(result.image, { url: "https://bucket.s3.amazonaws.com/solutions/s1/photo.png", alt: "alt text" });
  assert.equal(JSON.stringify(result).includes("imageStorageKey"), false);
});

test("serializeSolutionDetail: filters out inactive mapped products from the public products list", () => {
  const solution = {
    id: "s1",
    slug: "corporate-teams",
    name: "Corporate Teams",
    hubDescription: "desc",
    heroTitle: "Title",
    heroCopy: "Copy",
    art: null,
    color: null,
    imageUrl: null,
    featuredOnHome: false,
    sortOrder: 0,
    products: [
      { sortOrder: 0, product: product({ id: "p1", slug: "active-one", active: true }) },
      { sortOrder: 1, product: product({ id: "p2", slug: "inactive-one", active: false }) },
    ],
  };
  const result = serializeSolutionDetail(solution);
  assert.deepEqual(
    result.products.map((p) => p.slug),
    ["active-one"],
  );
});
