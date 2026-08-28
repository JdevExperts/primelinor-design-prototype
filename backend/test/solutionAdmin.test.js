const test = require("node:test");
const assert = require("node:assert/strict");
const {
  countActiveMappedProducts,
  assertActivationValid,
} = require("../src/services/catalogAdmin/solutionAdmin");
const ApiError = require("../src/utils/ApiError");

test("countActiveMappedProducts: counts only mappings whose product is active", () => {
  const products = [
    { productId: "a", product: { active: true } },
    { productId: "b", product: { active: false } },
    { productId: "c", product: { active: true } },
  ];
  assert.equal(countActiveMappedProducts(products), 2);
});

test("countActiveMappedProducts: zero for an empty or undefined list", () => {
  assert.equal(countActiveMappedProducts([]), 0);
  assert.equal(countActiveMappedProducts(undefined), 0);
});

test("assertActivationValid: throws when activating with zero active mapped products", () => {
  assert.throws(() => assertActivationValid(true, 0), ApiError);
});

test("assertActivationValid: does not throw when activating with at least one active mapped product", () => {
  assert.doesNotThrow(() => assertActivationValid(true, 1));
});

test("assertActivationValid: does not throw for a draft (inactive) solution regardless of product count", () => {
  assert.doesNotThrow(() => assertActivationValid(false, 0));
  assert.doesNotThrow(() => assertActivationValid(false, 3));
});
