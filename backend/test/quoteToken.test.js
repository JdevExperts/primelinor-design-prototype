const test = require("node:test");
const assert = require("node:assert/strict");
const { generateToken, hashToken } = require("../src/services/quoteToken");

test("generateToken: raw token has high entropy (32 random bytes, base64url)", () => {
  const { raw } = generateToken();
  assert.ok(raw.length >= 40, "expected a long opaque token, not something short/guessable");
  assert.match(raw, /^[A-Za-z0-9_-]+$/);
});

test("generateToken: two calls never produce the same raw token", () => {
  const a = generateToken();
  const b = generateToken();
  assert.notEqual(a.raw, b.raw);
  assert.notEqual(a.hash, b.hash);
});

test("generateToken: hash is never equal to the raw token (never store raw)", () => {
  const { raw, hash } = generateToken();
  assert.notEqual(raw, hash);
});

test("hashToken: deterministic for the same input", () => {
  const { raw, hash } = generateToken();
  assert.equal(hashToken(raw), hash);
});

test("hashToken: different inputs produce different hashes", () => {
  assert.notEqual(hashToken("token-a"), hashToken("token-b"));
});

test("hashToken: output looks like a hex sha256 digest", () => {
  const hash = hashToken("anything");
  assert.match(hash, /^[a-f0-9]{64}$/);
});
