/**
 * Static business identity facts (Phase 6B owner-input closure) — the
 * business name and registered address don't vary per environment the way
 * WHATSAPP_NUMBER/SUPPORT_EMAIL/PUBLIC_APP_URL already do (those stay env
 * vars, already the correct pattern), so they live here as one small,
 * dependency-free constant rather than three more required env vars for
 * values that are never actually going to differ between dev and
 * production. Currently only consumed by services/quotePdf.js.
 *
 * WEBSITE_* is the canonical marketing site shown on customer documents.
 * It is deliberately NOT derived from PUBLIC_APP_URL: that env var is the
 * app origin used to build quote links and is a localhost URL in dev, and
 * a customer-facing PDF must never print a runtime localhost host (task
 * §12). quotePdf.js still prefers PUBLIC_APP_URL when it is a real public
 * origin and only falls back to this constant otherwise.
 */
module.exports = {
  // Customer-facing name on the quotation (PDF + public quote). "PrimeLinor"
  // only — not "PrimeLinor Bulk" — per owner instruction.
  BUSINESS_NAME: "PrimeLinor",
  BUSINESS_TAGLINE: "Custom Products for Your Brand",
  ADDRESS_LINES: ["2nd Floor, C-107, C Block", "Sector 10, Noida, Uttar Pradesh 201301, India"],
  WEBSITE_URL: "https://primelinorbulk.com",
  WEBSITE_DISPLAY: "primelinorbulk.com",
};
