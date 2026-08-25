/**
 * Customer quotation access tokens (Phase 4 §3). A quotation is reachable
 * at /quote/:token — the human-readable reference (PL-RQ-2026-000123-V2)
 * must never grant access on its own, only possession of this opaque
 * token does.
 *
 * The raw token is 256 bits of `crypto.randomBytes` (not a UUID v4, which
 * carries only ~122 bits of real entropy and a fixed, guessable format) —
 * effectively unguessable. Only its SHA-256 hash is ever persisted
 * (`Quotation.accessTokenHash`); the raw value is returned to the caller
 * exactly once, at generation time, for the admin to copy/share. SHA-256
 * (fast, unsalted) is the right hash here, unlike password hashing —
 * the token itself has 256 bits of entropy, so a fast hash costs an
 * attacker nothing extra since guessing the input is already infeasible;
 * slow hashing (bcrypt) would only add needless server cost.
 */
const crypto = require("node:crypto");

function generateToken() {
  const raw = crypto.randomBytes(32).toString("base64url");
  return { raw, hash: hashToken(raw) };
}

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

module.exports = { generateToken, hashToken };
