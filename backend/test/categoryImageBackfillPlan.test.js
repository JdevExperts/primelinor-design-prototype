const test = require("node:test");
const assert = require("node:assert/strict");
const { decideAction, resolveDeleteKey } = require("../scripts/lib/categoryImageBackfillPlan");

test("decideAction: CREATE when the category has no image yet", () => {
  const action = decideAction({ existingImageUrl: null, existingImageStorageKey: null, categoryId: "cat-1" });
  assert.equal(action, "CREATE");
});

test("decideAction: SKIP_ALREADY_UPLOADED when this system already owns the current image for this category (idempotent rerun)", () => {
  const action = decideAction({
    existingImageUrl: "https://bucket.s3.amazonaws.com/categories/cat-1/abc-file.png",
    existingImageStorageKey: "categories/cat-1/abc-file.png",
    categoryId: "cat-1",
  });
  assert.equal(action, "SKIP_ALREADY_UPLOADED");
});

test("decideAction: REPLACE when force is set even though this system owns the current image", () => {
  const action = decideAction({
    existingImageUrl: "https://bucket.s3.amazonaws.com/categories/cat-1/abc-file.png",
    existingImageStorageKey: "categories/cat-1/abc-file.png",
    categoryId: "cat-1",
    force: true,
  });
  assert.equal(action, "REPLACE");
});

test("decideAction: REPLACE (never SKIP) when an image exists but was never uploaded by this system (external/unknown, storageKey null)", () => {
  const action = decideAction({
    existingImageUrl: "https://some-other-host.example.com/logo.png",
    existingImageStorageKey: null,
    categoryId: "cat-1",
  });
  assert.equal(action, "REPLACE");
});

test("decideAction: REPLACE when a storageKey is set but for a DIFFERENT category's prefix (not owned by this category)", () => {
  const action = decideAction({
    existingImageUrl: "https://bucket.s3.amazonaws.com/categories/some-other-cat/abc-file.png",
    existingImageStorageKey: "categories/some-other-cat/abc-file.png",
    categoryId: "cat-1",
  });
  assert.equal(action, "REPLACE");
});

test("resolveDeleteKey: null when there was no previous storage key (nothing owned to delete)", () => {
  assert.equal(resolveDeleteKey({ previousStorageKey: null, newKey: "categories/cat-1/new.png" }), null);
});

test("resolveDeleteKey: null when the previous key is identical to the new key (no-op replace)", () => {
  const key = "categories/cat-1/same.png";
  assert.equal(resolveDeleteKey({ previousStorageKey: key, newKey: key }), null);
});

test("resolveDeleteKey: returns the previous key when it was owned and differs from the new key (safe replacement)", () => {
  const result = resolveDeleteKey({ previousStorageKey: "categories/cat-1/old.png", newKey: "categories/cat-1/new.png" });
  assert.equal(result, "categories/cat-1/old.png");
});

test("resolveDeleteKey: an external/unknown image (no previous storage key) is never returned as a deletion candidate, regardless of the new key", () => {
  assert.equal(resolveDeleteKey({ previousStorageKey: null, newKey: "categories/cat-1/new.png" }), null);
});
