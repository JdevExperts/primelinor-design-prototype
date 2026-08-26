/**
 * Minimal width/height sniffing for the 3 raster types category images
 * are allowed to be (productAssetValidation.js's ACCEPTED_TYPES) — reads
 * directly from format headers rather than pulling in an image-processing
 * dependency for a one-off backfill script's sanity check. Returns null
 * (not a thrown error) when a format's dimensions can't be read; callers
 * treat that as "unknown, not a hard failure" for the two WEBP container
 * variants this doesn't decode.
 */
function readPngDimensions(buffer) {
  if (buffer.length < 24) return null;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  if (!isPng) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readJpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    // SOF0/1/2/3/5/6/7/9/10/11/13/14/15 carry frame dimensions; skip the rest.
    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (isSof) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + segmentLength;
  }
  return null;
}

function readWebpDimensions(buffer) {
  if (buffer.length < 30) return null;
  const isRiffWebp = buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  if (!isRiffWebp) return null;
  const chunkType = buffer.toString("ascii", 12, 16);
  if (chunkType === "VP8X") {
    // 24-bit little-endian width-minus-1 / height-minus-1 at fixed offsets.
    const width = 1 + (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16));
    const height = 1 + (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16));
    return { width, height };
  }
  if (chunkType === "VP8 " && buffer.length >= 30) {
    // Lossy: 14-bit width/height, top 2 bits are a scale factor we ignore.
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height };
  }
  return null; // VP8L (lossless) bit-packs dimensions — not worth decoding for a sanity check.
}

function readImageDimensions(buffer) {
  return readPngDimensions(buffer) || readJpegDimensions(buffer) || readWebpDimensions(buffer) || null;
}

module.exports = { readImageDimensions };
