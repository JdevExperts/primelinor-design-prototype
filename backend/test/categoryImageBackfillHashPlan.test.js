const test = require("node:test");
const assert = require("node:assert/strict");
const { decideActionFromHashes } = require("../scripts/lib/categoryImageBackfillPlan");

test("decideActionFromHashes: REPLACE when the category has no image yet (nothing to compare)", () => {
  const action = decideActionFromHashes({ existingImageUrl: null, localHash: "abc123", remoteHash: null });
  assert.equal(action, "REPLACE");
});

test("decideActionFromHashes: UNCHANGED when the local file's content hash matches the currently-live image's hash", () => {
  const action = decideActionFromHashes({
    existingImageUrl: "https://bucket.s3.amazonaws.com/categories/c1/old.png",
    localHash: "same-hash",
    remoteHash: "same-hash",
  });
  assert.equal(action, "UNCHANGED");
});

test("decideActionFromHashes: REPLACE when the local file's content differs from what's currently live (genuine new creative)", () => {
  const action = decideActionFromHashes({
    existingImageUrl: "https://bucket.s3.amazonaws.com/categories/c1/old.png",
    localHash: "new-hash",
    remoteHash: "old-hash",
  });
  assert.equal(action, "REPLACE");
});

test("decideActionFromHashes: REPLACE when the remote hash could not be determined (fetch failed) — never silently treated as unchanged", () => {
  const action = decideActionFromHashes({
    existingImageUrl: "https://bucket.s3.amazonaws.com/categories/c1/old.png",
    localHash: "new-hash",
    remoteHash: null,
  });
  assert.equal(action, "REPLACE");
});

test("decideActionFromHashes: force=true replaces even when hashes match", () => {
  const action = decideActionFromHashes({
    existingImageUrl: "https://bucket.s3.amazonaws.com/categories/c1/old.png",
    localHash: "same-hash",
    remoteHash: "same-hash",
    force: true,
  });
  assert.equal(action, "REPLACE");
});

test("decideActionFromHashes: does not infer change from filename/timestamp — only the hash comparison matters", () => {
  // Same hash, regardless of what the (irrelevant here) filename would suggest.
  const action = decideActionFromHashes({
    existingImageUrl: "https://bucket.s3.amazonaws.com/categories/c1/very-old-name.png",
    localHash: "identical-content-hash",
    remoteHash: "identical-content-hash",
  });
  assert.equal(action, "UNCHANGED");
});
