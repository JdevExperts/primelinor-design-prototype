const test = require("node:test");
const assert = require("node:assert/strict");
const { detectMimeType, validateUploadedFile, sanitizeSvg, MAX_SIZE_BYTES } = require("../src/services/artworkValidation");

const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0]);
const JPEG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0]);
const SVG_TEXT = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>');

test("detectMimeType: sniffs PNG by magic bytes", () => {
  assert.equal(detectMimeType(PNG_BYTES), "image/png");
});

test("detectMimeType: sniffs JPEG by magic bytes", () => {
  assert.equal(detectMimeType(JPEG_BYTES), "image/jpeg");
});

test("detectMimeType: sniffs SVG by content", () => {
  assert.equal(detectMimeType(SVG_TEXT), "image/svg+xml");
});

test("detectMimeType: returns null for unrecognized content, regardless of extension claims", () => {
  assert.equal(detectMimeType(Buffer.from("just plain text, not an image")), null);
});

test("validateUploadedFile: rejects a mislabeled file whose content doesn't match any accepted format", () => {
  const file = { buffer: Buffer.from("not really a png"), size: 17, mimetype: "image/png" };
  const result = validateUploadedFile(file);
  assert.equal(result.ok, false);
});

test("validateUploadedFile: accepts real PNG content even if it arrives with no reported mimetype", () => {
  const file = { buffer: PNG_BYTES, size: PNG_BYTES.length };
  const result = validateUploadedFile(file);
  assert.equal(result.ok, true);
  assert.equal(result.mimeType, "image/png");
});

test("validateUploadedFile: rejects oversized files", () => {
  const file = { buffer: PNG_BYTES, size: MAX_SIZE_BYTES + 1 };
  const result = validateUploadedFile(file);
  assert.equal(result.ok, false);
});

test("sanitizeSvg: strips <script> tags", () => {
  const dirty = '<svg><script>alert(1)</script><rect/></svg>';
  const clean = sanitizeSvg(dirty);
  assert.equal(clean.includes("<script"), false);
  assert.equal(clean.includes("<rect/>"), true);
});

test("sanitizeSvg: strips event-handler attributes", () => {
  const dirty = '<svg onload="alert(1)"><rect onclick="alert(2)"/></svg>';
  const clean = sanitizeSvg(dirty);
  assert.equal(clean.includes("onload"), false);
  assert.equal(clean.includes("onclick"), false);
});

test("sanitizeSvg: neutralizes javascript: URIs", () => {
  const dirty = '<svg><a href="javascript:alert(1)">x</a></svg>';
  const clean = sanitizeSvg(dirty);
  assert.equal(clean.includes("javascript:"), false);
});

test("sanitizeSvg: leaves safe markup untouched", () => {
  const safe = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><circle cx="5" cy="5" r="4" fill="red"/></svg>';
  assert.equal(sanitizeSvg(safe), safe);
});
