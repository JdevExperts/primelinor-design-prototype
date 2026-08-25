const test = require("node:test");
const assert = require("node:assert/strict");
const { validateConfig, hasObjectStorageConfigured } = require("../src/startup/validateConfig");

const BASE_DEV_ENV = { NODE_ENV: "development", DATABASE_URL: "postgres://localhost/db" };

const BASE_PROD_ENV = {
  NODE_ENV: "production",
  DATABASE_URL: "postgres://prod/db",
  JWT_SECRET: "secret",
  FRONTEND_ORIGIN: "https://app.example.com",
  PUBLIC_APP_URL: "https://app.example.com",
  AWS_S3_BUCKET: "bucket",
  AWS_ACCESS_KEY_ID: "key",
  AWS_SECRET_ACCESS_KEY: "secret",
};

test("validateConfig: fails when DATABASE_URL is missing, in any environment", () => {
  const result = validateConfig({ NODE_ENV: "development" });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("DATABASE_URL")));
});

test("validateConfig: a minimal dev env with just DATABASE_URL is fine", () => {
  const result = validateConfig(BASE_DEV_ENV);
  assert.equal(result.ok, true);
});

test("validateConfig: production requires JWT_SECRET/FRONTEND_ORIGIN/PUBLIC_APP_URL", () => {
  const rest = { ...BASE_PROD_ENV };
  delete rest.JWT_SECRET;
  const result = validateConfig(rest);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("JWT_SECRET")));
});

test("validateConfig: production without object storage configured fails fast", () => {
  const rest = { ...BASE_PROD_ENV };
  delete rest.AWS_S3_BUCKET;
  const result = validateConfig(rest);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("AWS_S3_BUCKET")));
});

test("validateConfig: a fully-configured production env passes", () => {
  const result = validateConfig(BASE_PROD_ENV);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("validateConfig: rejects a malformed WHATSAPP_NUMBER", () => {
  const result = validateConfig({ ...BASE_DEV_ENV, WHATSAPP_NUMBER: "+91 98765" });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("WHATSAPP_NUMBER")));
});

test("validateConfig: accepts a digits-only WHATSAPP_NUMBER with country code", () => {
  const result = validateConfig({ ...BASE_DEV_ENV, WHATSAPP_NUMBER: "919812345678" });
  assert.equal(result.ok, true);
});

test("hasObjectStorageConfigured: false unless all three AWS vars are present and non-blank", () => {
  assert.equal(hasObjectStorageConfigured({}), false);
  assert.equal(hasObjectStorageConfigured({ AWS_S3_BUCKET: "b", AWS_ACCESS_KEY_ID: "", AWS_SECRET_ACCESS_KEY: "s" }), false);
  assert.equal(
    hasObjectStorageConfigured({ AWS_S3_BUCKET: "b", AWS_ACCESS_KEY_ID: "k", AWS_SECRET_ACCESS_KEY: "s" }),
    true,
  );
});
