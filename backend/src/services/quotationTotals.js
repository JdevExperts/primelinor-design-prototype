/**
 * Pure, DB-free total calculation — the ONE place quotation math happens
 * (Phase 3 §20/§21). A client-submitted lineTotal/subtotal/grandTotal is
 * never trusted: PRODUCT/SHIPPING lines with both quantity and unitPrice
 * get their lineTotal recomputed from those two numbers; every other line
 * (DISCOUNT, ADJUSTMENT, or a flat PRODUCT/SHIPPING line with no
 * quantity/unitPrice, e.g. a custom branding fee) keeps its directly
 * staff-entered lineTotal as the one place that amount is authored — there
 * is no separate "override total" field anywhere.
 */
function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function computeLineTotal(line) {
  if ((line.lineType === "PRODUCT" || line.lineType === "SHIPPING") && line.quantity != null && line.unitPrice != null) {
    return round2(line.quantity * line.unitPrice);
  }
  return round2(line.lineTotal ?? 0);
}

/**
 * Returns { lines, subtotal, grandTotal } — `lines` carries each input line
 * plus its authoritative `lineTotal`. subtotal = PRODUCT+SHIPPING lines
 * only; DISCOUNT/ADJUSTMENT lines (and the manual taxAmount) are applied on
 * top to reach grandTotal.
 */
function computeQuotationTotals(lines, taxAmount) {
  const computedLines = lines.map((line, index) => ({
    ...line,
    lineTotal: computeLineTotal(line),
    sortOrder: line.sortOrder ?? index,
  }));

  const subtotal = round2(
    computedLines
      .filter((line) => line.lineType === "PRODUCT" || line.lineType === "SHIPPING")
      .reduce((sum, line) => sum + line.lineTotal, 0),
  );

  const adjustmentsTotal = round2(
    computedLines
      .filter((line) => line.lineType === "DISCOUNT" || line.lineType === "ADJUSTMENT")
      .reduce((sum, line) => sum + line.lineTotal, 0),
  );

  const tax = taxAmount != null ? round2(Number(taxAmount)) : 0;
  const grandTotal = round2(subtotal + adjustmentsTotal + tax);

  return { lines: computedLines, subtotal, grandTotal };
}

module.exports = { round2, computeLineTotal, computeQuotationTotals };
