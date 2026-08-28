const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeDownloadFilename,
  resolveCategorySlugForFile,
  CANONICAL_FILENAME_TO_SLUG,
  TARGET_CATEGORY_SLUGS,
  DEFAULT_ALT_TEXT_BY_SLUG,
} = require("../scripts/lib/categoryImageMapping");

test("normalizeDownloadFilename: strips a single duplicate-download suffix", () => {
  assert.equal(normalizeDownloadFilename("tshirts-category (1).webp"), "tshirts-category.webp");
});

test("normalizeDownloadFilename: strips a multi-digit duplicate-download suffix", () => {
  assert.equal(normalizeDownloadFilename("polo-category (12).webp"), "polo-category.webp");
});

test("normalizeDownloadFilename: leaves an already-canonical filename unchanged (aside from lowercasing)", () => {
  assert.equal(normalizeDownloadFilename("Bags-Category.webp"), "bags-category.webp");
});

test("normalizeDownloadFilename: does not strip a parenthesized non-numeric suffix (not a download-duplicate marker)", () => {
  assert.equal(normalizeDownloadFilename("bags-category (final).webp"), "bags-category (final).webp");
});

test("resolveCategorySlugForFile: matches a canonical filename with no override map needed", () => {
  const result = resolveCategorySlugForFile("tshirts-category.webp");
  assert.equal(result.slug, "tshirts");
  assert.equal(result.method, "canonical-filename");
});

test("resolveCategorySlugForFile: matches a canonical filename after normalizing a duplicate-download suffix", () => {
  const result = resolveCategorySlugForFile("gift-kits-category (2).webp");
  assert.equal(result.slug, "kits");
  assert.equal(result.method, "canonical-filename");
});

test("resolveCategorySlugForFile: falls back to an explicit known-file override when the filename isn't canonical", () => {
  const result = resolveCategorySlugForFile("photo-export-001.png", {
    knownOverrides: { "photo-export-001.png": "notebooks" },
  });
  assert.equal(result.slug, "notebooks");
  assert.equal(result.method, "known-file-override");
});

test("resolveCategorySlugForFile: UNMATCHED when a filename matches neither canonical names nor the override map", () => {
  const result = resolveCategorySlugForFile("random-export-99.png", { knownOverrides: {} });
  assert.equal(result.slug, null);
  assert.equal(result.method, null);
});

test("resolveCategorySlugForFile: with no options given (default empty overrides), an unmatched file stays unmatched", () => {
  const result = resolveCategorySlugForFile("random-export-99.png");
  assert.equal(result.slug, null);
});

test("CANONICAL_FILENAME_TO_SLUG: covers exactly the 9 categories named in the task brief", () => {
  assert.deepEqual(
    Object.values(CANONICAL_FILENAME_TO_SLUG).sort(),
    ["bags", "bottles", "corporate-gifts", "kits", "notebooks", "polo", "promotional", "tshirts", "visiting-cards"].sort(),
  );
});

test("TARGET_CATEGORY_SLUGS: every managed category has a default alt text entry (no MISSING_LOCAL category is ever left without one on upload)", () => {
  for (const slug of TARGET_CATEGORY_SLUGS) {
    assert.ok(DEFAULT_ALT_TEXT_BY_SLUG[slug], `missing default alt text for "${slug}"`);
  }
});

test("DEFAULT_ALT_TEXT_BY_SLUG: alt text never mentions AI or a placeholder brand name shown in the source photo", () => {
  for (const alt of Object.values(DEFAULT_ALT_TEXT_BY_SLUG)) {
    assert.doesNotMatch(alt.toLowerCase(), /\b(ai|generated|verda|nexora|northline|momentum|altura)\b/);
  }
});
