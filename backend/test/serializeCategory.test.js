const test = require("node:test");
const assert = require("node:assert/strict");
const { serializeCategory } = require("../src/services/serialize");

test("serializeCategory: image is null when the category has no imageUrl", () => {
  const category = { id: "c1", slug: "bags", name: "Bags", sortOrder: 1, imageUrl: null, imageAlt: null, children: [] };
  assert.equal(serializeCategory(category).image, null);
});

test("serializeCategory: image is {url, alt} when set, and never exposes imageStorageKey", () => {
  const category = {
    id: "c1",
    slug: "bags",
    name: "Bags",
    sortOrder: 1,
    imageUrl: "https://bucket.s3.amazonaws.com/categories/c1/bags.png",
    imageStorageKey: "categories/c1/bags.png",
    imageAlt: "Bags",
    children: [],
  };
  const result = serializeCategory(category);
  assert.deepEqual(result.image, { url: "https://bucket.s3.amazonaws.com/categories/c1/bags.png", alt: "Bags" });
  assert.equal(JSON.stringify(result).includes("imageStorageKey"), false);
  assert.equal(JSON.stringify(result).includes("categories/c1/bags.png".replace("bags.png", "")), true); // sanity: url itself still present
});

test("serializeCategory: child categories also carry their own image (or null), independent of the parent's", () => {
  const category = {
    id: "parent",
    slug: "apparel",
    name: "Apparel",
    sortOrder: 1,
    imageUrl: null,
    imageAlt: null,
    children: [
      {
        id: "child-1",
        slug: "tshirts",
        name: "T-Shirts",
        sortOrder: 1,
        active: true,
        imageUrl: "https://bucket.s3.amazonaws.com/categories/child-1/tshirts.png",
        imageStorageKey: "categories/child-1/tshirts.png",
        imageAlt: "T-Shirts",
      },
      {
        id: "child-2",
        slug: "hoodies",
        name: "Hoodies",
        sortOrder: 2,
        active: true,
        imageUrl: null,
        imageAlt: null,
      },
    ],
  };
  const result = serializeCategory(category);
  assert.deepEqual(result.children[0].image, { url: "https://bucket.s3.amazonaws.com/categories/child-1/tshirts.png", alt: "T-Shirts" });
  assert.equal(result.children[1].image, null);
  assert.equal(JSON.stringify(result).includes("imageStorageKey"), false);
});

test("serializeCategory: inactive children are still excluded regardless of image state (existing behavior unchanged)", () => {
  const category = {
    id: "parent",
    slug: "apparel",
    name: "Apparel",
    sortOrder: 1,
    imageUrl: null,
    children: [
      { id: "child-1", slug: "tshirts", name: "T-Shirts", sortOrder: 1, active: false, imageUrl: "https://x/y.png", imageAlt: null },
    ],
  };
  assert.equal(serializeCategory(category).children.length, 0);
});
