const test = require("node:test");
const assert = require("node:assert/strict");
const { assertBackfillAllowed } = require("../src/utils/backfillGuard");

const OPTS = { flagName: "ALLOW_X_BACKFILL", label: "x" };

test("assertBackfillAllowed: throws in production regardless of flag/dry-run", () => {
  assert.throws(() => assertBackfillAllowed({ NODE_ENV: "production", ALLOW_X_BACKFILL: "true" }, { ...OPTS, dryRun: false }));
  assert.throws(() => assertBackfillAllowed({ NODE_ENV: "production" }, { ...OPTS, dryRun: true }));
});

test("assertBackfillAllowed: throws outside production without the flag and without --dry-run", () => {
  assert.throws(() => assertBackfillAllowed({ NODE_ENV: "development" }, { ...OPTS, dryRun: false }));
});

test("assertBackfillAllowed: does not throw outside production with --dry-run, flag absent", () => {
  assert.doesNotThrow(() => assertBackfillAllowed({ NODE_ENV: "development" }, { ...OPTS, dryRun: true }));
});

test("assertBackfillAllowed: does not throw outside production with the flag set", () => {
  assert.doesNotThrow(() => assertBackfillAllowed({ NODE_ENV: "development", ALLOW_X_BACKFILL: "true" }, { ...OPTS, dryRun: false }));
});
