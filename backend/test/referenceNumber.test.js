const test = require("node:test");
const assert = require("node:assert/strict");
const { formatReference } = require("../src/services/referenceNumber");

test("formatReference: pads the sequence value to 6 digits", () => {
  const ref = formatReference("LD", 42);
  assert.match(ref, /^PL-LD-\d{4}-000042$/);
});

test("formatReference: does not truncate a value wider than 6 digits", () => {
  const ref = formatReference("RQ", 1234567);
  assert.match(ref, /^PL-RQ-\d{4}-1234567$/);
});
