const test = require("node:test");
const assert = require("node:assert/strict");
const { assertSeedAllowed } = require("../src/utils/seedGuard");

test("assertSeedAllowed: throws when NODE_ENV=production and no override is set", () => {
  assert.throws(() => assertSeedAllowed({ NODE_ENV: "production" }));
});

test("assertSeedAllowed: does not throw when NODE_ENV=production but ALLOW_DEV_SEED=true", () => {
  assert.doesNotThrow(() => assertSeedAllowed({ NODE_ENV: "production", ALLOW_DEV_SEED: "true" }));
});

test("assertSeedAllowed: does not throw outside production", () => {
  assert.doesNotThrow(() => assertSeedAllowed({ NODE_ENV: "development" }));
  assert.doesNotThrow(() => assertSeedAllowed({ NODE_ENV: "test" }));
});
