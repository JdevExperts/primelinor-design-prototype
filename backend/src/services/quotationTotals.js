/**
 * Pure, DB-free total calculation — the ONE place quotation math happens
 * (Phase 3 §20/§21). A client-submitted lineTotal/subtotal/grandTotal is
 * never trusted: PRODUCT/SHIPPING lines with both quantity and unitPrice
 * get their lineTotal recomputed from those two numbers; every other line
 * (DISCOUNT, ADJUSTMENT, or a flat PRODUCT/SHIPPING line with no
 * quantity/unitPrice, e.g. a custom branding fee) keeps its directly
 * staff-entered lineTotal as the one place that amount is authored — there
 * is no separate "override total" field anywhere.
 *
 * Sales Quotation Workspace (Phase B): a PRODUCT/SHIPPING line may exist
 * with a quantity but no rate yet — a real draft state while sales is
 * still negotiating. That line's amount is `null` ("rate required"), NOT
 * ₹0, so it neither inflates nor silently drops from the total. When any
 * such line exists the result reports `pricingComplete: false` and the UI
 * shows "Pricing incomplete" instead of a misleading ₹0 grand total
 * (§10/§11).
 */
function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

/** true when this line still needs a rate before it can be priced. */
function lineNeedsRate(line) {
  if (line.lineType !== "PRODUCT" && line.lineType !== "SHIPPING") return false;
  const hasComputable = line.quantity != null && line.unitPrice != null;
  const hasManualAmount = line.lineTotal != null;
  return !hasComputable && !hasManualAmount;
}

/** The line's amount, or `null` when it still needs a rate. */
function computeLineTotal(line) {
  if ((line.lineType === "PRODUCT" || line.lineType === "SHIPPING") && line.quantity != null && line.unitPrice != null) {
    return round2(line.quantity * line.unitPrice);
  }
  if (lineNeedsRate(line)) return null;
  return round2(line.lineTotal ?? 0);
}

/**
 * Returns { lines, subtotal, grandTotal, pricingComplete, linesNeedingRate }.
 * `lines` carries each input line plus its authoritative `lineTotal` (which
 * may be null for a rate-pending line). subtotal = PRODUCT+SHIPPING priced
 * lines only; DISCOUNT/ADJUSTMENT lines (and the manual taxAmount) are
 * applied on top to reach grandTotal. Rate-pending lines are excluded from
 * the sums and counted in `linesNeedingRate`.
 */
function computeQuotationTotals(lines, taxAmount) {
  const computedLines = lines.map((line, index) => ({
    ...line,
    lineTotal: computeLineTotal(line),
    sortOrder: line.sortOrder ?? index,
  }));

  const linesNeedingRate = computedLines.filter((line) => line.lineTotal == null).length;
  const pricingComplete = linesNeedingRate === 0;

  const subtotal = round2(
    computedLines
      .filter((line) => (line.lineType === "PRODUCT" || line.lineType === "SHIPPING") && line.lineTotal != null)
      .reduce((sum, line) => sum + line.lineTotal, 0),
  );

  const adjustmentsTotal = round2(
    computedLines
      .filter((line) => (line.lineType === "DISCOUNT" || line.lineType === "ADJUSTMENT") && line.lineTotal != null)
      .reduce((sum, line) => sum + line.lineTotal, 0),
  );

  const tax = taxAmount != null ? round2(Number(taxAmount)) : 0;
  const grandTotal = round2(subtotal + adjustmentsTotal + tax);

  return { lines: computedLines, subtotal, grandTotal, pricingComplete, linesNeedingRate };
}

module.exports = { round2, lineNeedsRate, computeLineTotal, computeQuotationTotals };
