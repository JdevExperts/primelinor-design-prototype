const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizePhone } = require("../src/services/phone");

test("normalizePhone: bare 10-digit Indian mobile", () => {
  assert.equal(normalizePhone("9876543210"), "+919876543210");
});

test("normalizePhone: with spaces and dashes", () => {
  assert.equal(normalizePhone("98765 43210"), "+919876543210");
  assert.equal(normalizePhone("98765-43210"), "+919876543210");
});

test("normalizePhone: leading zero", () => {
  assert.equal(normalizePhone("09876543210"), "+919876543210");
});

test("normalizePhone: with country code, no plus", () => {
  assert.equal(normalizePhone("919876543210"), "+919876543210");
});

test("normalizePhone: with +91", () => {
  assert.equal(normalizePhone("+91 98765 43210"), "+919876543210");
});

test("normalizePhone: rejects a number not starting 6-9", () => {
  assert.equal(normalizePhone("5876543210"), null);
});

test("normalizePhone: rejects too short", () => {
  assert.equal(normalizePhone("12345"), null);
});

test("normalizePhone: accepts an explicit non-Indian international number", () => {
  assert.equal(normalizePhone("+14155552671"), "+14155552671");
});

test("normalizePhone: rejects empty/garbage", () => {
  assert.equal(normalizePhone(""), null);
  assert.equal(normalizePhone("abc"), null);
  assert.equal(normalizePhone(null), null);
});
