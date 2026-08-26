const test = require("node:test");
const assert = require("node:assert/strict");
const {
  parseFilename,
  resolveSlug,
  wasAlreadyUploaded,
} = require("../scripts/lib/catalogImageMapping");

test("parseFilename: accepts the <slug>-catalog-<NN>.<ext> convention", () => {
  const result = parseFilename("executive-gift-set-catalog-01.png");
  assert.equal(result.ok, true);
  assert.equal(result.rawSlug, "executive-gift-set");
  assert.equal(result.batchNumber, "01");
  assert.equal(result.ext, ".png");
});

test("parseFilename: accepts webp/jpg/jpeg extensions case-insensitively", () => {
  assert.equal(parseFilename("ceramic-mug-catalog-01.WEBP").ok, true);
  assert.equal(parseFilename("ceramic-mug-catalog-01.JPG").ok, true);
  assert.equal(parseFilename("ceramic-mug-catalog-01.jpeg").ok, true);
});

test("parseFilename: rejects unsupported extensions (e.g. SVG)", () => {
  const result = parseFilename("ceramic-mug-catalog-01.svg");
  assert.equal(result.ok, false);
  assert.match(result.reason, /unsupported extension/);
});

test("parseFilename: rejects filenames that don't match the naming convention", () => {
  const result = parseFilename("random-photo.png");
  assert.equal(result.ok, false);
  assert.match(result.reason, /does not match/);
});

test("resolveSlug: exact slug match", () => {
  const known = new Set(["ceramic-mug", "conference-kit"]);
  const result = resolveSlug("ceramic-mug", known);
  assert.equal(result.matchType, "exact");
  assert.equal(result.slug, "ceramic-mug");
});

test("resolveSlug: resolves a known alias to its real product slug", () => {
  const known = new Set(["conference-kit", "festival-gift-box"]);
  const result = resolveSlug("conference-gift-set", known);
  assert.equal(result.matchType, "alias");
  assert.equal(result.slug, "conference-kit");
  assert.equal(result.aliasFrom, "conference-gift-set");
});

test("resolveSlug: unmatched slug returns null with nearest-slug suggestions, never a guess", () => {
  const known = new Set(["ceramic-mug", "metal-pen"]);
  const result = resolveSlug("ceramic-mugg", known);
  assert.equal(result.matchType, "unmatched");
  assert.equal(result.slug, null);
  assert.ok(result.suggestions.includes("ceramic-mug"));
});

test("resolveSlug: completely unrelated slug yields no suggestions", () => {
  const known = new Set(["ceramic-mug", "metal-pen"]);
  const result = resolveSlug("totally-unrelated-product-name", known);
  assert.equal(result.matchType, "unmatched");
  assert.deepEqual(result.suggestions, []);
});

test("wasAlreadyUploaded: detects a prior upload of the exact same source filename via storageKey suffix", () => {
  const existingAssets = [
    { storageKey: "products/abc-123/9f2c1a3e-ceramic-mug-catalog-01.png", active: true },
  ];
  assert.equal(wasAlreadyUploaded(existingAssets, "ceramic-mug-catalog-01.png"), true);
});

test("wasAlreadyUploaded: false when no existing asset matches this filename", () => {
  const existingAssets = [
    { storageKey: "products/abc-123/9f2c1a3e-some-other-file.png", active: true },
  ];
  assert.equal(wasAlreadyUploaded(existingAssets, "ceramic-mug-catalog-01.png"), false);
});

test("wasAlreadyUploaded: false for URL-only legacy assets with no storageKey", () => {
  const existingAssets = [{ storageKey: null, url: "https://pl-bulk.s3.example.com/legacy.png" }];
  assert.equal(wasAlreadyUploaded(existingAssets, "ceramic-mug-catalog-01.png"), false);
});
