const test = require("node:test");
const assert = require("node:assert/strict");
const {
  slugify,
  resolveUniqueSlug,
  cleanDescription,
  materialFromFabricName,
  pricingSlabsToTiers,
  sizesToVariants,
  resolveLegacyImageUrl,
  LEGACY_S3_BASE_URL,
} = require("../scripts/lib/catalogTransform");

test("slugify: normalizes to lowercase-hyphenated form", () => {
  assert.equal(slugify("Premium Corporate Polo"), "premium-corporate-polo");
  assert.equal(slugify("Round Neck 114"), "round-neck-114");
  assert.equal(slugify("  Extra   Spaces  "), "extra-spaces");
});

test("resolveUniqueSlug: returns the base slug when untaken", () => {
  assert.equal(resolveUniqueSlug("cotton-tote", new Set()), "cotton-tote");
});

test("resolveUniqueSlug: appends -2, -3... predictably on collision", () => {
  const taken = new Set(["cotton-tote", "cotton-tote-2"]);
  assert.equal(resolveUniqueSlug("cotton-tote", taken), "cotton-tote-3");
});

test("cleanDescription: strips emoji and collapses excess blank lines without rewriting content", () => {
  const dirty = "🧸 Kids' Tee\n\n\n\nGreat for play.\n\n👕";
  const clean = cleanDescription(dirty);
  assert.equal(clean.includes("🧸"), false);
  assert.equal(clean.includes("👕"), false);
  assert.equal(clean.includes("\n\n\n"), false);
  assert.equal(clean.includes("Great for play."), true);
});

test("materialFromFabricName: maps known legacy fabric names to short material strings", () => {
  assert.equal(materialFromFabricName("Cotton (100% Cotton)"), "100% cotton");
  assert.equal(materialFromFabricName("Dry-Fit (Sports Polyester)"), "polyester");
  assert.equal(materialFromFabricName("Cotton Blend (Poly-Cotton)"), "poly-cotton");
});

test("materialFromFabricName: falls back to a lowercased version of an unmapped name rather than throwing", () => {
  assert.equal(materialFromFabricName("Some New Fabric"), "some new fabric");
});

test("materialFromFabricName: null/undefined input returns null", () => {
  assert.equal(materialFromFabricName(null), null);
  assert.equal(materialFromFabricName(undefined), null);
});

test("pricingSlabsToTiers: sorts ascending and derives MOQ from the lowest tier", () => {
  const slabs = [
    { min_quantity: "500", max_quantity: null, price_per_unit: "160.00" },
    { min_quantity: "50", max_quantity: "99", price_per_unit: "180.00" },
    { min_quantity: "100", max_quantity: "499", price_per_unit: "170.00" },
  ];
  const { tiers, moq } = pricingSlabsToTiers(slabs);
  assert.equal(moq, 50);
  assert.deepEqual(
    tiers.map((t) => t.minQty),
    [50, 100, 500],
  );
  assert.equal(tiers[2].maxQty, null);
  assert.equal(tiers[0].unitPrice, 180);
});

test("pricingSlabsToTiers: empty slab list returns no tiers and a null MOQ", () => {
  const { tiers, moq } = pricingSlabsToTiers([]);
  assert.deepEqual(tiers, []);
  assert.equal(moq, null);
});

test("sizesToVariants: converts a legacy size array to ordered ProductVariant rows", () => {
  const variants = sizesToVariants(["S", "M", "L"]);
  assert.deepEqual(
    variants.map((v) => v.code),
    ["s", "m", "l"],
  );
  assert.deepEqual(
    variants.map((v) => v.label),
    ["S", "M", "L"],
  );
});

test("sizesToVariants: empty/null sizes never fabricate a default size run", () => {
  assert.deepEqual(sizesToVariants([]), []);
  assert.deepEqual(sizesToVariants(null), []);
});

test("resolveLegacyImageUrl: resolves a bare relative S3 key against the confirmed legacy bucket", () => {
  const result = resolveLegacyImageUrl("images/products/abc-123/photo.png");
  assert.equal(result.ok, true);
  assert.equal(result.url, `${LEGACY_S3_BASE_URL}/images/products/abc-123/photo.png`);
});

test("resolveLegacyImageUrl: passes through an already-absolute https URL unchanged", () => {
  const result = resolveLegacyImageUrl("https://example.com/real-photo.jpg");
  assert.equal(result.ok, true);
  assert.equal(result.url, "https://example.com/real-photo.jpg");
});

test("resolveLegacyImageUrl: rejects an empty URL", () => {
  assert.equal(resolveLegacyImageUrl("").ok, false);
  assert.equal(resolveLegacyImageUrl(null).ok, false);
});

test("resolveLegacyImageUrl: rejects a placehold.co placeholder image", () => {
  const result = resolveLegacyImageUrl("https://placehold.co/800x800/1e40af/ffffff?text=Test");
  assert.equal(result.ok, false);
  assert.match(result.reason, /placeholder/);
});

test("resolveLegacyImageUrl: rejects an obviously local/dev path", () => {
  assert.equal(resolveLegacyImageUrl("file:///Users/dev/image.png").ok, false);
  assert.equal(resolveLegacyImageUrl("localhost:3000/image.png").ok, false);
});

test("resolveLegacyImageUrl: rejects a key containing path traversal", () => {
  assert.equal(resolveLegacyImageUrl("images/../../../etc/passwd").ok, false);
});
