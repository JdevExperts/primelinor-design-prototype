const test = require("node:test");
const assert = require("node:assert/strict");
const { selectPrimaryImage } = require("../src/services/productImageSelection");

test("selectPrimaryImage: CATALOG asset is preferred over GALLERY_FRONT", () => {
  const result = selectPrimaryImage([
    { type: "GALLERY_FRONT", url: "gallery.png", alt: "Gallery", active: true, sortOrder: 0 },
    { type: "CATALOG", url: "catalog.png", alt: "Catalog", active: true, sortOrder: 1 },
  ]);
  assert.deepEqual(result, { url: "catalog.png", alt: "Catalog" });
});

test("selectPrimaryImage: falls back to GALLERY_FRONT when no CATALOG asset exists", () => {
  const result = selectPrimaryImage([
    { type: "DETAIL", url: "detail.png", alt: null, active: true, sortOrder: 0 },
    { type: "GALLERY_FRONT", url: "gallery.png", alt: "Gallery", active: true, sortOrder: 1 },
  ]);
  assert.deepEqual(result, { url: "gallery.png", alt: "Gallery" });
});

test("selectPrimaryImage: falls back to the first active asset by sortOrder when neither CATALOG nor GALLERY_FRONT exists", () => {
  const result = selectPrimaryImage([
    { type: "DETAIL", url: "second.png", alt: null, active: true, sortOrder: 2 },
    { type: "GALLERY_BACK", url: "first.png", alt: "Back", active: true, sortOrder: 1 },
  ]);
  assert.deepEqual(result, { url: "first.png", alt: "Back" });
});

test("selectPrimaryImage: ignores inactive assets even when they would otherwise win", () => {
  const result = selectPrimaryImage([
    { type: "CATALOG", url: "inactive-catalog.png", alt: null, active: false, sortOrder: 0 },
    { type: "GALLERY_FRONT", url: "active-gallery.png", alt: "Gallery", active: true, sortOrder: 1 },
  ]);
  assert.deepEqual(result, { url: "active-gallery.png", alt: "Gallery" });
});

test("selectPrimaryImage: respects sortOrder among assets of the same type", () => {
  const result = selectPrimaryImage([
    { type: "CATALOG", url: "later.png", alt: null, active: true, sortOrder: 5 },
    { type: "CATALOG", url: "earlier.png", alt: "Earlier", active: true, sortOrder: 1 },
  ]);
  assert.deepEqual(result, { url: "earlier.png", alt: "Earlier" });
});

test("selectPrimaryImage: returns null when there are no assets", () => {
  assert.equal(selectPrimaryImage([]), null);
  assert.equal(selectPrimaryImage(null), null);
});

test("selectPrimaryImage: returns null when every asset is inactive", () => {
  const result = selectPrimaryImage([{ type: "CATALOG", url: "x.png", alt: null, active: false, sortOrder: 0 }]);
  assert.equal(result, null);
});
