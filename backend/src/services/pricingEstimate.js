/**
 * Server-authoritative RFQItem pricing estimate. Mirrors the frontend's
 * quoteForQuantity()/findTier() (src/utils/pricing.js) exactly, but reads
 * directly off the real Prisma Product + ProductPriceTier rows — the
 * frontend-submitted price is never trusted (Phase 2 §12). This is an
 * ESTIMATE snapshot, not a negotiated quotation: it is computed once at
 * submission time and frozen on RFQItem, never recalculated later even if
 * catalogue pricing changes afterward.
 */
function findTier(product, quantity) {
  const tiers = product.priceTiers || [];
  return (
    tiers.find((tier) => {
      if (quantity < tier.minQty) return false;
      if (tier.maxQty == null) return true;
      return quantity <= tier.maxQty;
    }) || null
  );
}

/**
 * Returns { unitPrice: number|null, total: number|null }. Both null means
 * "price on request" — a legitimate, expected outcome for QUOTE_ONLY
 * products, or a TIERED product whose quantity falls outside every
 * configured tier (below MOQ, or above the highest tier's maxQty).
 */
function computeEstimateForQuantity(product, quantity) {
  if (product.priceMode === "QUOTE_ONLY") {
    return { unitPrice: null, total: null };
  }

  if (product.priceMode === "TIERED") {
    const tier = findTier(product, quantity);
    if (!tier) return { unitPrice: null, total: null };
    const unitPrice = Number(tier.unitPrice);
    return { unitPrice, total: Number((unitPrice * quantity).toFixed(2)) };
  }

  if (product.priceMode === "FIXED" && product.fixedPrice != null) {
    const unitPrice = Number(product.fixedPrice);
    return { unitPrice, total: Number((unitPrice * quantity).toFixed(2)) };
  }

  return { unitPrice: null, total: null };
}

module.exports = { computeEstimateForQuantity, findTier };
