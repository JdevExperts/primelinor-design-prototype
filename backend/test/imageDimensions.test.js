const test = require("node:test");
const assert = require("node:assert/strict");
const { readImageDimensions } = require("../scripts/lib/imageDimensions");

function pngBuffer(width, height) {
  // Minimal valid PNG signature + IHDR chunk header carrying width/height
  // — readImageDimensions only reads bytes 16-23, so the rest of a real
  // PNG (IDAT/IEND, checksums) isn't needed for this.
  const buf = Buffer.alloc(24);
  buf.write("\x89PNG\r\n\x1a\n", 0, "binary");
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

test("readImageDimensions: reads width/height from a PNG IHDR chunk", () => {
  const result = readImageDimensions(pngBuffer(1254, 1254));
  assert.deepEqual(result, { width: 1254, height: 1254 });
});

test("readImageDimensions: returns null for a buffer too short to be a real image", () => {
  assert.equal(readImageDimensions(Buffer.from("nope")), null);
});

test("readImageDimensions: returns null for a non-image buffer of plausible length", () => {
  assert.equal(readImageDimensions(Buffer.alloc(64, 0)), null);
});
