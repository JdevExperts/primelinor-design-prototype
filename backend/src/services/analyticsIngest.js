/**
 * Pure helpers for first-party analytics ingestion. No Prisma, no I/O —
 * the route builds a request context and passes it in. Everything here is
 * privacy-conservative by construction (see PROJECT §10/§15/§16):
 *   - raw IP is never returned or stored, only used transiently upstream
 *     for rate-limiting;
 *   - the User-Agent is reduced to a coarse device category, not stored;
 *   - /admin and /quote paths are rejected;
 *   - obvious bots and identifier-less hits are dropped.
 */

const EVENT_TYPES = [
  "PAGE_VIEW",
  "PRODUCT_VIEW",
  "PRODUCT_CARD_CLICK",
  "CATEGORY_VIEW",
  "SOLUTION_VIEW",
  "SEARCH",
  "QUOTE_CTA_CLICK",
  "RFQ_STARTED",
  "RFQ_SUBMITTED",
  "WHATSAPP_CLICK",
  "CONTACT_CLICK",
];

const SEARCH_QUERY_MAX = 120;
const PATH_MAX = 512;

// Deliberately small — this is noise reduction, not a bot-detection
// product (§16).
const BOT_UA_RE =
  /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|pinterest|vkshare|w3c_validator|headlesschrome|python-requests|axios\/|curl\/|wget|go-http-client|libwww|lighthouse|gtmetrix|pingdom|uptimerobot/i;

const TABLET_UA_RE = /ipad|tablet|playbook|silk|(android(?!.*mobile))/i;
const MOBILE_UA_RE = /mobi|iphone|ipod|android.*mobile|windows phone|blackberry|bb10|opera mini/i;

/** MOBILE | DESKTOP | TABLET | OTHER — never the raw UA (§12). */
function normalizeDeviceType(userAgent) {
  const ua = String(userAgent || "");
  if (!ua) return "OTHER";
  if (TABLET_UA_RE.test(ua)) return "TABLET";
  if (MOBILE_UA_RE.test(ua)) return "MOBILE";
  if (/mozilla|chrome|safari|firefox|edg|opera|windows|macintosh|linux|x11/i.test(ua)) return "DESKTOP";
  return "OTHER";
}

function isBotUserAgent(userAgent) {
  return BOT_UA_RE.test(String(userAgent || ""));
}

/**
 * A path is trackable as a marketing page view only if it is a real
 * public route. Admin console and token quote pages are never website
 * analytics (§15) — quote viewing already has its own RFQActivity events.
 */
function isTrackablePath(path) {
  if (path == null) return true; // events without a path (e.g. a CTA click) are fine
  const p = String(path);
  if (!p.startsWith("/")) return false;
  if (p.startsWith("/admin")) return false;
  if (p.startsWith("/quote/") || p === "/quote") return false;
  if (p.startsWith("/api/") || p === "/health" || p === "/sitemap.xml" || p === "/robots.txt") return false;
  return true;
}

/** Trim + bound a public search query so a pathological string can't bloat the row (§21). */
function sanitizeSearchQuery(query) {
  if (query == null) return null;
  const clean = String(query).replace(/\s+/g, " ").trim().toLowerCase();
  if (!clean) return null;
  return clean.slice(0, SEARCH_QUERY_MAX);
}

/**
 * Coarse acquisition bucket from referrer + UTM (§19). Never fabricates
 * attribution — an unknown external referrer is "Other Referral", a
 * missing referrer with no UTM is "Direct".
 */
function classifyReferrer({ referrer, utmSource, utmMedium } = {}) {
  const src = String(utmSource || "").toLowerCase();
  const medium = String(utmMedium || "").toLowerCase();
  if (src || medium) {
    if (/google|bing|duckduckgo/.test(src) || medium === "organic") return "Google/Search";
    if (/insta/.test(src)) return "Instagram";
    if (/indiamart|india-mart/.test(src)) return "IndiaMART";
    if (/whatsapp|wa/.test(src)) return "WhatsApp";
    if (/cpc|ppc|paid|ads?|email|newsletter|campaign/.test(medium) || medium === "social") return "Campaign";
    return "Campaign";
  }
  const ref = String(referrer || "").toLowerCase();
  if (!ref) return "Direct";
  let host = ref;
  try {
    host = new URL(ref).hostname.toLowerCase();
  } catch {
    /* keep raw */
  }
  if (/(^|\.)google\.|(^|\.)bing\.|duckduckgo|(^|\.)yahoo\./.test(host)) return "Google/Search";
  if (/instagram\.com/.test(host)) return "Instagram";
  if (/indiamart\.com/.test(host)) return "IndiaMART";
  if (/whatsapp\.com|wa\.me/.test(host)) return "WhatsApp";
  if (/facebook\.com|fb\.com|t\.co|twitter\.com|x\.com|linkedin\.com|youtube\.com/.test(host)) return "Other Referral";
  return "Other Referral";
}

/**
 * Country from an edge/proxy header if the platform provides one
 * (Cloudflare `cf-ipcountry`, some CDNs `x-vercel-ip-country` /
 * `x-geo-country`). No external geo lookup is performed and no such
 * dependency is added (§10) — state/city stay null until a real provider
 * is configured in a later phase.
 */
function geoFromHeaders(headers = {}) {
  const cc =
    headers["cf-ipcountry"] ||
    headers["x-vercel-ip-country"] ||
    headers["x-geo-country"] ||
    headers["x-country-code"] ||
    null;
  const country = cc && /^[A-Za-z]{2}$/.test(cc) && cc.toUpperCase() !== "XX" ? cc.toUpperCase() : null;
  const rawState = headers["x-vercel-ip-country-region"] || headers["x-geo-region"] || null;
  const rawCity = headers["x-vercel-ip-city"] || headers["x-geo-city"] || null;
  const state = rawState ? decodeURIComponent(String(rawState)).slice(0, 80) || null : null;
  const city = rawCity ? decodeURIComponent(String(rawCity)).slice(0, 80) || null : null;
  return { country, state, city };
}

/**
 * Turn a validated client payload + request context into the row we
 * persist, or `null` if the event should be silently dropped (bot,
 * admin/quote path, no visitor id). Never throws.
 */
function buildEventRow(payload, ctx = {}) {
  if (!payload || !EVENT_TYPES.includes(payload.eventType)) return null;
  if (isBotUserAgent(ctx.userAgent)) return null;
  if (!payload.visitorId) return null; // an identifier-less hit is noise (§16)

  const path = payload.path != null ? String(payload.path).slice(0, PATH_MAX) : null;
  if (payload.eventType === "PAGE_VIEW" && !isTrackablePath(path)) return null;
  if (path && (path.startsWith("/admin") || path.startsWith("/quote/"))) return null;

  const geo = geoFromHeaders(ctx.headers || {});

  return {
    eventType: payload.eventType,
    visitorId: String(payload.visitorId).slice(0, 64),
    sessionId: payload.sessionId ? String(payload.sessionId).slice(0, 64) : null,
    path,
    referrer: payload.referrer ? String(payload.referrer).slice(0, 512) : null,
    referrerGroup: classifyReferrer(payload),
    utmSource: payload.utmSource ? String(payload.utmSource).slice(0, 120) : null,
    utmMedium: payload.utmMedium ? String(payload.utmMedium).slice(0, 120) : null,
    utmCampaign: payload.utmCampaign ? String(payload.utmCampaign).slice(0, 120) : null,
    productId: payload.productId ? String(payload.productId).slice(0, 64) : null,
    productCode: payload.productCode ? String(payload.productCode).slice(0, 32) : null,
    categoryId: payload.categoryId ? String(payload.categoryId).slice(0, 64) : null,
    solutionId: payload.solutionId ? String(payload.solutionId).slice(0, 64) : null,
    searchQuery: payload.eventType === "SEARCH" ? sanitizeSearchQuery(payload.searchQuery) : null,
    searchResultCount:
      payload.eventType === "SEARCH" && Number.isInteger(payload.searchResultCount)
        ? Math.max(0, Math.min(payload.searchResultCount, 100000))
        : null,
    deviceType: normalizeDeviceType(ctx.userAgent),
    country: geo.country,
    state: geo.state,
    city: geo.city,
    metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : null,
    isTest: Boolean(ctx.isTest),
  };
}

module.exports = {
  EVENT_TYPES,
  SEARCH_QUERY_MAX,
  normalizeDeviceType,
  isBotUserAgent,
  isTrackablePath,
  sanitizeSearchQuery,
  classifyReferrer,
  geoFromHeaders,
  buildEventRow,
};
