/**
 * The ONE canonical rule for "what image represents this product" (Phase
 * 6A.1 §2/§30/§31) — used by both the public catalog serializer (listing
 * cards: Homepage/Listing/Related Products/Corporate Gifting all share
 * one `mapApiProductToListingShape` on the frontend, so fixing this one
 * function fixes all of them at once) and the admin catalogue list.
 * Previously duplicated ad-hoc (admin had its own simpler "first CATALOG
 * asset" version; the public API didn't compute a primary image at all,
 * which is why PDP — which fetches the full asset list for its gallery —
 * showed real photos while every other surface didn't).
 *
 * Priority: active CATALOG asset → active GALLERY_FRONT asset → first
 * active asset by sortOrder → none. Never considers an inactive asset.
 * Defensively re-filters/re-sorts itself rather than trusting the caller's
 * query already did so, since it's cheap and this is exactly the kind of
 * invariant worth not taking on faith.
 */
function selectPrimaryImage(assets) {
  const active = (assets || [])
    .filter((a) => a.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (!active.length) return null;

  const catalog = active.find((a) => a.type === "CATALOG");
  if (catalog) return { url: catalog.url, alt: catalog.alt ?? null };

  const galleryFront = active.find((a) => a.type === "GALLERY_FRONT");
  if (galleryFront) return { url: galleryFront.url, alt: galleryFront.alt ?? null };

  return { url: active[0].url, alt: active[0].alt ?? null };
}

module.exports = { selectPrimaryImage };
