const test = require("node:test");
const assert = require("node:assert/strict");
const { serializeProductSummary, serializeProductDetail } = require("../src/services/serialize");

function baseProduct(overrides = {}) {
  return {
    id: "p1",
    slug: "premium-polo",
    name: "Premium Polo",
    primaryCategory: { id: "cat-1", slug: "polo", name: "Polo T-Shirts", active: true },
    categories: [
      { sortOrder: 0, category: { id: "cat-1", slug: "polo", name: "Polo T-Shirts", active: true } },
      { sortOrder: 1, category: { id: "cat-2", slug: "sports", name: "Sports Teams & Clubs", active: true } },
    ],
    material: null,
    gsm: null,
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
    ...overrides,
  };
}

test("serializeProductSummary: exposes primaryCategory and the full categories membership list", () => {
  const result = serializeProductSummary(baseProduct());
  assert.deepEqual(result.primaryCategory, { id: "cat-1", slug: "polo", name: "Polo T-Shirts" });
  assert.deepEqual(
    result.categories.map((c) => c.slug),
    ["polo", "sports"],
  );
});

test("serializeProductSummary: `category` is a temporary alias for primaryCategory (Solutions Phase 0 §G back-compat)", () => {
  const result = serializeProductSummary(baseProduct());
  assert.deepEqual(result.category, result.primaryCategory);
});

test("serializeProductSummary: each category ref carries this product's membership sortOrder (Category Merchandising Audit §5/§6)", () => {
  const result = serializeProductSummary(baseProduct());
  assert.deepEqual(
    result.categories.map((c) => ({ slug: c.slug, sortOrder: c.sortOrder })),
    [
      { slug: "polo", sortOrder: 0 },
      { slug: "sports", sortOrder: 1 },
    ],
  );
});

test("serializeProductDetail: exposes an ordered, de-duplicated `images` gallery separate from the raw `assets` array", () => {
  const product = baseProduct({
    description: "desc",
    longSpec: null,
    variantType: null,
    variants: [],
    specifications: [],
    tags: [],
    placementZones: [],
    assets: [
      { id: "cf", type: "CUSTOMIZATION_FRONT", url: "shared.jpg", storageKey: null, alt: null, sortOrder: 0, active: true },
      { id: "cat", type: "CATALOG", url: "cat.jpg", storageKey: null, alt: "Front", sortOrder: 0, active: true },
      { id: "gf", type: "GALLERY_FRONT", url: "shared.jpg", storageKey: null, alt: null, sortOrder: 1, active: true },
      { id: "off", type: "DETAIL", url: "off.jpg", storageKey: null, alt: null, sortOrder: 0, active: false },
    ],
  });

  const result = serializeProductDetail(product, []);

  // CATALOG first, then GALLERY_FRONT; the CUSTOMIZATION_FRONT that reuses
  // the GALLERY_FRONT URL is dropped, and the inactive DETAIL is excluded.
  assert.deepEqual(
    result.images.map((i) => i.id),
    ["cat", "gf"],
  );
  assert.deepEqual(result.images[0], { id: "cat", url: "cat.jpg", alt: "Front", sortOrder: 0 });
  // primaryImage and images[0] agree — the PDP opens on the card's photo.
  assert.equal(result.images[0].url, result.primaryImage.url);
  // the raw asset collection is still shipped for Studio / placement logic.
  assert.equal(result.assets.length, 4);
});

test("serializeProductSummary: an inactive secondary category membership is excluded from the public categories list", () => {
  const product = baseProduct({
    categories: [
      { sortOrder: 0, category: { id: "cat-1", slug: "polo", name: "Polo T-Shirts", active: true } },
      { sortOrder: 1, category: { id: "cat-2", slug: "sports", name: "Sports Teams & Clubs", active: false } },
    ],
  });
  const result = serializeProductSummary(product);
  assert.deepEqual(
    result.categories.map((c) => c.slug),
    ["polo"],
  );
});
