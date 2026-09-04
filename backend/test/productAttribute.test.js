const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateAttributeValue,
  reviewStatusFromAttributes,
  buildAttributeWhere,
  isValidAttributeKey,
  REVIEW_PENDING_KEY,
} = require("../src/services/productAttributeService");

const cfg = (valueType, key = "TEST_ATTR") => ({ key, valueType });

// ── §28 C. BOOLEAN validation ───────────────────────────────────────
test("C. BOOLEAN: only a JS boolean is accepted", () => {
  assert.equal(validateAttributeValue(cfg("BOOLEAN"), true), true);
  assert.equal(validateAttributeValue(cfg("BOOLEAN"), false), false);
  assert.throws(() => validateAttributeValue(cfg("BOOLEAN"), "true"), /boolean/);
  assert.throws(() => validateAttributeValue(cfg("BOOLEAN"), 1), /boolean/);
  assert.throws(() => validateAttributeValue(cfg("BOOLEAN"), null), /boolean/);
});

// ── §28 D. STRING validation ────────────────────────────────────────
test("D. STRING: only a JS string is accepted", () => {
  assert.equal(validateAttributeValue(cfg("STRING"), "Needs photography"), "Needs photography");
  assert.equal(validateAttributeValue(cfg("STRING"), ""), "");
  assert.throws(() => validateAttributeValue(cfg("STRING"), 12), /string/);
  assert.throws(() => validateAttributeValue(cfg("STRING"), true), /string/);
});

// ── §28 E. NUMBER validation ────────────────────────────────────────
test("E. NUMBER: only a finite JS number is accepted", () => {
  assert.equal(validateAttributeValue(cfg("NUMBER"), 25), 25);
  assert.equal(validateAttributeValue(cfg("NUMBER"), 0), 0);
  assert.equal(validateAttributeValue(cfg("NUMBER"), -3.5), -3.5);
  assert.throws(() => validateAttributeValue(cfg("NUMBER"), "12"), /number/);
  assert.throws(() => validateAttributeValue(cfg("NUMBER"), NaN), /number/);
  assert.throws(() => validateAttributeValue(cfg("NUMBER"), Infinity), /number/);
});

// ── §28 F. JSON validation ─────────────────────────────────────────
test("F. JSON: any JSON-serialisable value; undefined rejected", () => {
  assert.deepEqual(validateAttributeValue(cfg("JSON"), { reason: "back image missing", priority: "high" }), {
    reason: "back image missing",
    priority: "high",
  });
  assert.deepEqual(validateAttributeValue(cfg("JSON"), [1, 2, 3]), [1, 2, 3]);
  assert.equal(validateAttributeValue(cfg("JSON"), "a scalar"), "a scalar");
  assert.equal(validateAttributeValue(cfg("JSON"), 42), 42);
  assert.equal(validateAttributeValue(cfg("JSON"), null), null);
  assert.throws(() => validateAttributeValue(cfg("JSON"), undefined), /JSON/);
});

// ── §28 G. invalid type rejected ──────────────────────────────────
test("G. an unknown valueType is rejected outright", () => {
  assert.throws(() => validateAttributeValue(cfg("WHATEVER"), "x"), /Unknown attribute value type/);
  assert.throws(() => validateAttributeValue(null, "x"), /Unknown attribute value type/);
});

// ── §28 N/O. review status derived purely from attribute presence ──
test("N/O. reviewStatusFromAttributes: PENDING iff the key is present", () => {
  assert.equal(reviewStatusFromAttributes([]), "COMPLETE");
  assert.equal(reviewStatusFromAttributes(null), "COMPLETE");
  assert.equal(
    reviewStatusFromAttributes([{ attribute: { key: REVIEW_PENDING_KEY }, value: true }]),
    "PENDING",
  );
  assert.equal(reviewStatusFromAttributes([{ attribute: { key: "SEASONAL" } }]), "COMPLETE");
  assert.equal(reviewStatusFromAttributes([REVIEW_PENDING_KEY]), "PENDING"); // plain key list
});

// ── §19/§28 N/O. attribute presence filter construction (no raw SQL) ──
test("buildAttributeWhere: hasAttribute → some, missingAttribute → none, both → AND", () => {
  assert.deepEqual(buildAttributeWhere({}), {});
  assert.deepEqual(buildAttributeWhere({ hasAttribute: REVIEW_PENDING_KEY }), {
    AND: [{ productAttributes: { some: { attribute: { key: REVIEW_PENDING_KEY } } } }],
  });
  assert.deepEqual(buildAttributeWhere({ missingAttribute: REVIEW_PENDING_KEY }), {
    AND: [{ productAttributes: { none: { attribute: { key: REVIEW_PENDING_KEY } } } }],
  });
  const both = buildAttributeWhere({ hasAttribute: "A_KEY", missingAttribute: "B_KEY" });
  assert.equal(both.AND.length, 2);
  // A non-machine key is ignored, never interpolated.
  assert.deepEqual(buildAttributeWhere({ hasAttribute: "drop table products" }), {});
});

test("isValidAttributeKey: UPPER_SNAKE_CASE only", () => {
  assert.equal(isValidAttributeKey("PRODUCT_REVIEW_PENDING"), true);
  assert.equal(isValidAttributeKey("NEEDS_PHOTOGRAPHY"), true);
  assert.equal(isValidAttributeKey("lowercase"), false);
  assert.equal(isValidAttributeKey("Has Space"), false);
  assert.equal(isValidAttributeKey("1STARTS_DIGIT"), false);
  assert.equal(isValidAttributeKey(""), false);
});
