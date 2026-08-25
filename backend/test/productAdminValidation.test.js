const test = require("node:test");
const assert = require("node:assert/strict");
const { assertTierCoversMoq, assertUniqueVariantCodes } = require("../src/services/catalogAdmin/productAdmin");
const ApiError = require("../src/utils/ApiError");

test("assertTierCoversMoq: throws when the lowest tier starts above MOQ", () => {
  assert.throws(
    () => assertTierCoversMoq(10, [{ minQty: 50, maxQty: 200, unitPrice: 9 }]),
    ApiError,
  );
});

test("assertTierCoversMoq: does not throw when the lowest tier covers MOQ exactly", () => {
  assert.doesNotThrow(() => assertTierCoversMoq(10, [{ minQty: 10, maxQty: 49, unitPrice: 349 }]));
});

test("assertTierCoversMoq: does not throw when the lowest tier starts below MOQ", () => {
  assert.doesNotThrow(() => assertTierCoversMoq(50, [{ minQty: 10, maxQty: 49, unitPrice: 349 }, { minQty: 50, unitPrice: 329 }]));
});

test("assertTierCoversMoq: a no-op with an empty tier list", () => {
  assert.doesNotThrow(() => assertTierCoversMoq(10, []));
});

test("assertUniqueVariantCodes: throws on a duplicate code", () => {
  assert.throws(
    () => assertUniqueVariantCodes([{ code: "s", label: "S" }, { code: "s", label: "Small" }]),
    ApiError,
  );
});

test("assertUniqueVariantCodes: does not throw with distinct codes", () => {
  assert.doesNotThrow(() => assertUniqueVariantCodes([{ code: "s", label: "S" }, { code: "m", label: "M" }]));
});
