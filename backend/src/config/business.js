/**
 * Static business identity facts (Phase 6B owner-input closure) — the
 * business name and registered address don't vary per environment the way
 * WHATSAPP_NUMBER/SUPPORT_EMAIL/PUBLIC_APP_URL already do (those stay env
 * vars, already the correct pattern), so they live here as one small,
 * dependency-free constant rather than three more required env vars for
 * values that are never actually going to differ between dev and
 * production. Currently only consumed by services/quotePdf.js.
 */
module.exports = {
  BUSINESS_NAME: "PrimeLinor Bulk",
  ADDRESS_LINES: ["2nd Floor, C-107, C Block", "Sector 10, Noida, Uttar Pradesh 201301, India"],
};
