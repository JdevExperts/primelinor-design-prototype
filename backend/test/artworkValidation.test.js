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
  assert.equal(clean.includes("<rect"), true);
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

test("sanitizeSvg: strips <foreignObject> (can smuggle arbitrary HTML/script inside an SVG)", () => {
  const dirty = '<svg><foreignObject><body xmlns="http://www.w3.org/1999/xhtml"><script>alert(1)</script></body></foreignObject><rect/></svg>';
  const clean = sanitizeSvg(dirty);
  assert.equal(clean.includes("foreignObject"), false);
  assert.equal(clean.includes("<script"), false);
});

test("sanitizeSvg: strips <iframe>/<embed>/<object>", () => {
  const dirty = '<svg><iframe src="https://evil.example"></iframe><embed src="x"/><object data="x"></object></svg>';
  const clean = sanitizeSvg(dirty);
  assert.equal(clean.includes("iframe"), false);
  assert.equal(clean.includes("embed"), false);
  assert.equal(clean.includes("object"), false);
});

test("sanitizeSvg: does not throw on malformed SVG, and strips what it can parse", () => {
  const malformed = '<svg><rect><script>alert(1)</script>';
  assert.doesNotThrow(() => sanitizeSvg(malformed));
  assert.equal(sanitizeSvg(malformed).includes("<script"), false);
});

test("sanitizeSvg: preserves safe markup (DOMPurify re-serializes self-closing tags but keeps structure/attributes)", () => {
  const safe = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><circle cx="5" cy="5" r="4" fill="red"/></svg>';
  const clean = sanitizeSvg(safe);
  assert.equal(clean.includes('width="10"'), true);
  assert.equal(clean.includes('height="10"'), true);
  assert.equal(clean.includes("<circle"), true);
  assert.equal(clean.includes('cx="5"'), true);
  assert.equal(clean.includes('fill="red"'), true);
});
