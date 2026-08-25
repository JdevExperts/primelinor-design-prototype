/**
 * `Cache-Control: no-cache` for the public catalog API (Phase 5 §47) — an
 * admin publishing/unpublishing a product or editing its price should
 * reflect on the next request, not sit behind a shared/browser cache for a
 * TTL window. `no-cache` (not `no-store`) is deliberate: this is ordinary
 * public content, not privacy-sensitive like the quote routes — a cache is
 * still allowed to store the response, it just has to revalidate before
 * reusing it, which is enough to keep this phase's admin-edit-then-verify
 * workflow honest without adding a real invalidation system.
 */
function noCache(req, res, next) {
  res.setHeader("Cache-Control", "no-cache");
  next();
}

module.exports = noCache;
