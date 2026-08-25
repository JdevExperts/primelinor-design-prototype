/**
 * Catalog ESTIMATE pricing only. This has nothing to do with negotiated
 * quotation pricing (Phase 2) — it exists purely so the catalog can show a
 * representative price and be sorted/filtered by it.
 *
 * Effective price rule (documented once, used everywhere — this is the
 * exact thing the old backend got wrong by silently ignoring it for its
 * `price_asc` sort):
 *
 *   FIXED       -> fixedPrice
 *   TIERED      -> the unit price at the product's MOQ, i.e. the tier with
 *                  the lowest minQty (the "entry" price, not the numerically
 *                  lowest — bulk tiers are cheaper per unit by design)
 *   QUOTE_ONLY  -> null (no public unit price)
 */
function effectivePrice(product) {
  if (product.priceMode === "FIXED") {
    return product.fixedPrice != null ? Number(product.fixedPrice) : null;
  }

  if (product.priceMode === "TIERED") {
    const tiers = product.priceTiers || [];
    if (!tiers.length) return null;
    const entryTier = tiers.reduce((lowest, tier) =>
      tier.minQty < lowest.minQty ? tier : lowest,
    );
    return Number(entryTier.unitPrice);
  }

  return null;
}

/** Sort comparator matching the documented rule above — nulls always last. */
function compareByEffectivePrice(a, b, direction = "asc") {
  const priceA = effectivePrice(a);
  const priceB = effectivePrice(b);
  if (priceA == null && priceB == null) return 0;
  if (priceA == null) return 1;
  if (priceB == null) return -1;
  return direction === "asc" ? priceA - priceB : priceB - priceA;
}

module.exports = { effectivePrice, compareByEffectivePrice };
