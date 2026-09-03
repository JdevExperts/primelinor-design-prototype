const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isCustomerGalleryAsset,
  assetVisualKey,
  buildCustomerGallery,
} = require("../src/services/productGallery");

const asset = (over = {}) => ({
  id: over.id || Math.random().toString(36).slice(2),
  type: "CATALOG",
  url: "https://cdn.example/img.jpg",
  storageKey: null,
  alt: null,
  sortOrder: 0,
  active: true,
  ...over,
});

// ── isCustomerGalleryAsset ──────────────────────────────────────────────
test("isCustomerGalleryAsset: accepts every active customer-facing role", () => {
  for (const type of [
    "CATALOG",
    "GALLERY_FRONT",
    "GALLERY_BACK",
    "DETAIL",
    "LIFESTYLE",
    "MODEL",
    "TEAM",
    "CUSTOMIZATION_FRONT",
    "CUSTOMIZATION_BACK",
  ]) {
    assert.equal(isCustomerGalleryAsset(asset({ type })), true, type);
  }
});

test("isCustomerGalleryAsset: rejects inactive assets, URL-less assets, and unknown/internal types", () => {
  assert.equal(isCustomerGalleryAsset(asset({ active: false })), false);
  assert.equal(isCustomerGalleryAsset(asset({ url: "" })), false);
  assert.equal(isCustomerGalleryAsset(asset({ url: "   " })), false);
  assert.equal(isCustomerGalleryAsset(asset({ type: "INTERNAL_TEMPLATE" })), false);
  assert.equal(isCustomerGalleryAsset(null), false);
});

// ── assetVisualKey ─────────────────────────────────────────────────────
test("assetVisualKey: storage key wins, URL is the fallback", () => {
  assert.equal(assetVisualKey(asset({ storageKey: "k/1.jpg", url: "u" })), "k/1.jpg");
  assert.equal(assetVisualKey(asset({ storageKey: "  ", url: "u" })), "u");
  assert.equal(assetVisualKey(asset({ storageKey: null, url: "u" })), "u");
});

// ── buildCustomerGallery: inclusion / exclusion ────────────────────────
test("buildCustomerGallery: includes active eligible assets, excludes inactive ones", () => {
  const images = buildCustomerGallery([
    asset({ id: "a", type: "CATALOG", url: "c.jpg" }),
    asset({ id: "b", type: "GALLERY_FRONT", url: "gf.jpg", active: false }),
    asset({ id: "c", type: "DETAIL", url: "d.jpg" }),
  ]);
  assert.deepEqual(
    images.map((i) => i.id),
    ["a", "c"],
  );
});

test("buildCustomerGallery: excludes internal/unknown-type assets even when active", () => {
  const images = buildCustomerGallery([
    asset({ id: "a", type: "CATALOG", url: "c.jpg" }),
    asset({ id: "x", type: "PRINT_TEMPLATE", url: "t.jpg" }),
  ]);
  assert.deepEqual(
    images.map((i) => i.id),
    ["a"],
  );
});

// ── buildCustomerGallery: ordering ─────────────────────────────────────
test("buildCustomerGallery: deterministic order — type rank, then sortOrder, then id", () => {
  const images = buildCustomerGallery([
    asset({ id: "life", type: "LIFESTYLE", url: "l.jpg", sortOrder: 0 }),
    asset({ id: "back", type: "GALLERY_BACK", url: "b.jpg", sortOrder: 9 }),
    asset({ id: "front2", type: "GALLERY_FRONT", url: "f2.jpg", sortOrder: 2 }),
    asset({ id: "front1", type: "GALLERY_FRONT", url: "f1.jpg", sortOrder: 1 }),
    asset({ id: "cat", type: "CATALOG", url: "c.jpg", sortOrder: 5 }),
    asset({ id: "cust", type: "CUSTOMIZATION_FRONT", url: "cf.jpg", sortOrder: 0 }),
  ]);
  assert.deepEqual(
    images.map((i) => i.id),
    ["cat", "front1", "front2", "back", "life", "cust"],
  );
});

test("buildCustomerGallery: ties broken by id so the order is stable across calls", () => {
  const input = [
    asset({ id: "z", type: "GALLERY_FRONT", url: "z.jpg", sortOrder: 0 }),
    asset({ id: "a", type: "GALLERY_FRONT", url: "a.jpg", sortOrder: 0 }),
  ];
  assert.deepEqual(
    buildCustomerGallery(input).map((i) => i.id),
    ["a", "z"],
  );
  assert.deepEqual(
    buildCustomerGallery([...input].reverse()).map((i) => i.id),
    ["a", "z"],
  );
});

// ── buildCustomerGallery: de-duplication ──────────────────────────────
test("buildCustomerGallery: the same underlying file is never repeated (dedupe by storageKey)", () => {
  const images = buildCustomerGallery([
    asset({ id: "gf", type: "GALLERY_FRONT", url: "shared.jpg", storageKey: "k/shared.jpg" }),
    asset({ id: "cf", type: "CUSTOMIZATION_FRONT", url: "shared.jpg", storageKey: "k/shared.jpg" }),
  ]);
  assert.deepEqual(
    images.map((i) => i.id),
    ["gf"],
  );
});

test("buildCustomerGallery: dedupe falls back to URL when storageKey is null (real Biowash shape)", () => {
  // 1 CATALOG + 7 GALLERY_FRONT + 1 CUSTOMIZATION_FRONT, no storage keys,
  // the customization mockup reuses one GALLERY_FRONT's URL.
  const assets = [
    asset({ id: "cat", type: "CATALOG", url: "c.jpg", sortOrder: 0 }),
    asset({ id: "cf", type: "CUSTOMIZATION_FRONT", url: "g2.jpg", sortOrder: 0 }),
    ...[1, 2, 3, 4, 5, 6, 7].map((n) =>
      asset({ id: `g${n}`, type: "GALLERY_FRONT", url: `g${n}.jpg`, sortOrder: n }),
    ),
  ];
  const images = buildCustomerGallery(assets);
  assert.equal(images.length, 8); // 9 rows − 1 duplicate URL
  assert.equal(images[0].id, "cat");
  assert.ok(!images.some((i) => i.id === "cf")); // the duplicate customization row is dropped
  assert.deepEqual(
    images.map((i) => i.url),
    ["c.jpg", "g1.jpg", "g2.jpg", "g3.jpg", "g4.jpg", "g5.jpg", "g6.jpg", "g7.jpg"],
  );
});

// ── buildCustomerGallery: shape & edges ───────────────────────────────
test("buildCustomerGallery: entry shape is { id, url, alt, sortOrder } only", () => {
  const [img] = buildCustomerGallery([
    asset({ id: "a", type: "CATALOG", url: "c.jpg", alt: "A tee", sortOrder: 3, storageKey: "k" }),
  ]);
  assert.deepEqual(img, { id: "a", url: "c.jpg", alt: "A tee", sortOrder: 3 });
});

test("buildCustomerGallery: a single-image product yields one entry; empty/null yields []", () => {
  assert.equal(buildCustomerGallery([asset({ type: "CATALOG" })]).length, 1);
  assert.deepEqual(buildCustomerGallery([]), []);
  assert.deepEqual(buildCustomerGallery(null), []);
});
