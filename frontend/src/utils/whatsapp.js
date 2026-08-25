/**
 * Pure WhatsApp click-to-chat helpers (Phase 4 §18/§19) — no WhatsApp
 * Business API, just a prefilled wa.me link. The phone number is never
 * hardcoded here; callers pass whatever GET /api/v1/config/public
 * reported, and the button is not rendered at all if that number is
 * absent (see src/api/config.js).
 */

/** Keeps only digits — wa.me needs the number with country code, no punctuation. */
function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

export function buildWhatsAppUrl(number, message) {
  const digits = digitsOnly(number);
  if (!digits) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}

export function buildLeadWhatsAppMessage(reference) {
  return `Hi PrimeLinor, I'm contacting you about enquiry ${reference}.`;
}

export function buildRfqWhatsAppMessage(reference) {
  return `Hi PrimeLinor, I submitted RFQ ${reference}.`;
}

export function buildQuoteWhatsAppMessage(quoteReference) {
  return `Hi PrimeLinor, I'm contacting you about quotation ${quoteReference}.`;
}

/**
 * QuoteModal is reused for both Lead and RFQ submissions (About/Solutions
 * submit a Lead, PDP/Studio/Corporate Gifting submit an RFQ) — the
 * reference prefix (PL-LD- vs PL-RQ-) is self-describing, so the right
 * wording can be picked without threading an extra prop through every
 * call site.
 */
export function buildReferenceWhatsAppMessage(reference) {
  if (reference?.startsWith("PL-LD-")) return buildLeadWhatsAppMessage(reference);
  if (reference?.startsWith("PL-RQ-")) return buildRfqWhatsAppMessage(reference);
  return `Hi PrimeLinor, I'm contacting you about ${reference}.`;
}
