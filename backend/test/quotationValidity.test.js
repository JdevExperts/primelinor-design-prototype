const test = require("node:test");
const assert = require("node:assert/strict");
const { DEFAULT_VALIDITY_DAYS, resolveValidUntil } = require("../src/services/quotationValidity");

test("DEFAULT_VALIDITY_DAYS is 7 (task §1)", () => {
  assert.equal(DEFAULT_VALIDITY_DAYS, 7);
});

test("resolveValidUntil: no explicit date -> issue date + 7 calendar days (task §21A)", () => {
  const issued = new Date("2026-09-02T10:00:00");
  const result = resolveValidUntil(undefined, issued);
  assert.equal(result.getFullYear(), 2026);
  assert.equal(result.getMonth(), 8); // September
  assert.equal(result.getDate(), 9);
});

test("resolveValidUntil: rolls over month boundaries correctly", () => {
  const result = resolveValidUntil(null, new Date("2026-09-28T00:00:00"));
  assert.equal(result.getMonth(), 9); // October
  assert.equal(result.getDate(), 5);
});

test("resolveValidUntil: an explicit date is preserved unchanged (task §21B)", () => {
  const explicit = "2026-12-01T00:00:00.000Z";
  const result = resolveValidUntil(explicit, new Date("2026-09-02T10:00:00"));
  assert.equal(result.toISOString(), new Date(explicit).toISOString());
});

test("resolveValidUntil: an explicit Date instance is preserved", () => {
  const explicit = new Date("2027-01-15T12:00:00.000Z");
  const result = resolveValidUntil(explicit, new Date());
  assert.equal(result.getTime(), explicit.getTime());
});

test("resolveValidUntil: defaults the issue date to now when omitted", () => {
  const before = Date.now();
  const result = resolveValidUntil().getTime();
  const after = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  assert.ok(result >= before + sevenDays - 2000 && result <= after + sevenDays + 2000);
});
