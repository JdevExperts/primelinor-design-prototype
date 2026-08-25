/**
 * Builds customer-facing URLs from the configured public app origin.
 * Separate from FRONTEND_ORIGIN (which is a CORS allowlist and may list
 * several dev ports) — this is specifically "the one canonical origin a
 * real customer link should point at".
 */
const PUBLIC_APP_URL = (process.env.PUBLIC_APP_URL || "http://localhost:5187").replace(/\/+$/, "");

function buildCustomerQuoteUrl(rawToken) {
  return `${PUBLIC_APP_URL}/quote/${rawToken}`;
}

module.exports = { buildCustomerQuoteUrl };
