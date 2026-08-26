/**
 * The ONE rule for "is this product actually usable in Studio right now"
 * (Phase 6A.1 §7/§20/§36) — computed, never stored (no schema field).
 *
 * `product.customizable` alone is not enough: a product can be flagged
 * customizable during planning before its photography/zones are
 * configured (exactly what the catalogue looked like at the start of this
 * phase — every customizable=true product had zero ProductAsset/
 * PlacementZone rows). Using the raw flag anywhere customer-facing —
 * PDP's "See With Your Logo" CTA, the Studio product switcher, a
 * ProductCard's "Try logo" action — sends customers to a dead-end
 * Unavailable screen. This mirrors the frontend's own real-data
 * eligibility check (utils/studioReal.js's buildRealStudioSetup) so the
 * two rules can never drift apart.
 *
 * Requires only that `assets` include `type` and `placementZones` include
 * `view` — both the public list/detail includes and the admin includes
 * already select at least that much.
 */
function isStudioReady(product) {
  if (!product?.customizable) return false;
  const hasFrontAsset = (product.assets || []).some((a) => a.type === "CUSTOMIZATION_FRONT");
  const hasFrontZone = (product.placementZones || []).some((z) => z.view === "FRONT");
  return hasFrontAsset && hasFrontZone;
}

module.exports = { isStudioReady };
