const test = require("node:test");
const assert = require("node:assert/strict");
const { assertActiveCategoryInvariant } = require("../src/services/catalogAdmin/productAdmin");
const ApiError = require("../src/utils/ApiError");

test("assertActiveCategoryInvariant: no-op for an inactive/draft product regardless of category state", () => {
  assert.doesNotThrow(() => assertActiveCategoryInvariant(false, [], "any-id"));
  assert.doesNotThrow(() => assertActiveCategoryInvariant(false, [{ id: "c1", active: false }], "c1"));
});

test("assertActiveCategoryInvariant: throws when activating with zero active category mappings", () => {
  assert.throws(() => assertActiveCategoryInvariant(true, [{ id: "c1", active: false }], "c1"), ApiError);
});

test("assertActiveCategoryInvariant: throws when primaryCategoryId isn't among the mapped categories", () => {
  assert.throws(
    () => assertActiveCategoryInvariant(true, [{ id: "c1", active: true }], "c-not-mapped"),
    ApiError,
  );
});

test("assertActiveCategoryInvariant: throws when the primary category itself is inactive, even if another mapped category is active", () => {
  assert.throws(
    () =>
      assertActiveCategoryInvariant(
        true,
        [
          { id: "c1", active: false }, // primary, inactive
          { id: "c2", active: true },
        ],
        "c1",
      ),
    ApiError,
  );
});

test("assertActiveCategoryInvariant: does not throw when the primary category is active", () => {
  assert.doesNotThrow(() =>
    assertActiveCategoryInvariant(
      true,
      [
        { id: "c1", active: true },
        { id: "c2", active: false },
      ],
      "c1",
    ),
  );
});
