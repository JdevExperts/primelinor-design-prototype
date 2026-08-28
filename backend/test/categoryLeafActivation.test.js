const test = require("node:test");
const assert = require("node:assert/strict");
const { assertLeafActivationValid } = require("../src/services/catalogAdmin/categoryAdmin");
const ApiError = require("../src/utils/ApiError");

test("assertLeafActivationValid: throws for an empty leaf (0 active products)", () => {
  assert.throws(() => assertLeafActivationValid(true, 0), ApiError);
});

test("assertLeafActivationValid: does not throw for a leaf with active products", () => {
  assert.doesNotThrow(() => assertLeafActivationValid(true, 1));
});

test("assertLeafActivationValid: a parent (not a leaf) is exempt even with 0 direct products", () => {
  assert.doesNotThrow(() => assertLeafActivationValid(false, 0));
});
