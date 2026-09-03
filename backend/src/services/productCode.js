/**
 * Product Code — the permanent, human-friendly identifier for a base
 * Product (never a variant/colour/size). Format: PL-[TYPE]-[NNN], e.g.
 * PL-PO-001. Uppercase, unique globally, stable once assigned.
 *
 * Pure + dependency-free so validation, the admin service, the backfill
 * script and tests all share exactly one definition.
 */

// 3 digits today; the regex tolerates 3–4 so a later widening to PL-PO-0001
// needs no code change here, only a data migration.
const PRODUCT_CODE_RE = /^PL-[A-Z]{2}-[0-9]{3,4}$/;

/** Uppercase + trim + collapse internal spaces. "  pl-po-001 " -> "PL-PO-001". */
function normalizeProductCode(value) {
  if (value == null) return value;
  return String(value).trim().replace(/\s+/g, "").toUpperCase();
}

function isValidProductCode(value) {
  return typeof value === "string" && PRODUCT_CODE_RE.test(value);
}

/** The 2-letter family prefix, e.g. "PL-PO-001" -> "PO". Null if malformed. */
function productCodeFamily(value) {
  const match = normalizeProductCode(value)?.match(/^PL-([A-Z]{2})-/);
  return match ? match[1] : null;
}

module.exports = { PRODUCT_CODE_RE, normalizeProductCode, isValidProductCode, productCodeFamily };
