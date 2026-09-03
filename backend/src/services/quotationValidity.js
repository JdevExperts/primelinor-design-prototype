/**
 * Quotation validity policy (task §1). Pure + DB-free so it can be unit
 * tested and reused by the PDF layer.
 *
 * Rule: an explicitly entered `validUntil` is always preserved as-is;
 * otherwise a newly created quotation is valid for 7 calendar days from
 * its issue date. Setting a real date at creation time means every
 * generated PDF has a concrete expiry to display — it never has to fall
 * back to "No expiry set".
 */
const DEFAULT_VALIDITY_DAYS = 7;

function addCalendarDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * @param {Date|string|number|null|undefined} explicit - a staff-entered validUntil, if any
 * @param {Date} [issuedAt] - the quotation issue date (defaults to now)
 * @returns {Date} the effective validUntil
 */
function resolveValidUntil(explicit, issuedAt = new Date()) {
  if (explicit) return new Date(explicit);
  return addCalendarDays(issuedAt, DEFAULT_VALIDITY_DAYS);
}

module.exports = { DEFAULT_VALIDITY_DAYS, addCalendarDays, resolveValidUntil };
