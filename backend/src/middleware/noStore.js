/**
 * `Cache-Control: private, no-store` (Production Hardening Patch §9) —
 * every response under a token-gated quote route carries commercially
 * sensitive data behind what is effectively a bearer credential; nothing
 * in the chain (browser disk cache, a shared proxy, a CDN) should be able
 * to retain a copy.
 */
function noStore(req, res, next) {
  res.setHeader("Cache-Control", "private, no-store");
  next();
}

module.exports = noStore;
