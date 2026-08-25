const test = require("node:test");
const assert = require("node:assert/strict");
const { isUniqueConstraintOn } = require("../src/utils/prismaErrors");

test("isUniqueConstraintOn: true for a P2002 whose target includes the field", () => {
  const err = { code: "P2002", meta: { target: ["rfq_id", "version"] } };
  assert.equal(isUniqueConstraintOn(err, "version"), true);
});

test("isUniqueConstraintOn: false when the field isn't in the violated target", () => {
  const err = { code: "P2002", meta: { target: ["rfq_id", "version"] } };
  assert.equal(isUniqueConstraintOn(err, "submission_id"), false);
});

test("isUniqueConstraintOn: false for a non-P2002 error", () => {
  const err = { code: "P2025", meta: { target: ["version"] } };
  assert.equal(isUniqueConstraintOn(err, "version"), false);
});

test("isUniqueConstraintOn: false when meta/target is missing, without throwing", () => {
  assert.equal(isUniqueConstraintOn({ code: "P2002" }, "version"), false);
  assert.equal(isUniqueConstraintOn(null, "version"), false);
  assert.equal(isUniqueConstraintOn(undefined, "version"), false);
});
