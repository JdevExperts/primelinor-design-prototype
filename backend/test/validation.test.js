const test = require("node:test");
const assert = require("node:assert/strict");
const { listProductsQuerySchema, slugParamSchema } = require("../src/validation/products.schema");

test("listProductsQuerySchema: applies defaults and coerces numeric strings", () => {
  const result = listProductsQuerySchema.parse({ page: "2", limit: "24" });
  assert.equal(result.page, 2);
  assert.equal(result.limit, 24);
  assert.equal(result.sort, "recommended");
});

test("listProductsQuerySchema: rejects an unknown sort value", () => {
  assert.throws(() => listProductsQuerySchema.parse({ sort: "cheapest" }));
});

test("listProductsQuerySchema: rejects unknown query keys", () => {
  assert.throws(() => listProductsQuerySchema.parse({ foo: "bar" }));
});

test("listProductsQuerySchema: coerces customizable from string 'true'", () => {
  const result = listProductsQuerySchema.parse({ customizable: "true" });
  assert.equal(result.customizable, true);
});

test("slugParamSchema: accepts a lowercase hyphenated slug", () => {
  const result = slugParamSchema.parse({ slug: "cotton-round-neck" });
  assert.equal(result.slug, "cotton-round-neck");
});

test("slugParamSchema: rejects a slug with invalid characters", () => {
  assert.throws(() => slugParamSchema.parse({ slug: "not a slug!" }));
});
