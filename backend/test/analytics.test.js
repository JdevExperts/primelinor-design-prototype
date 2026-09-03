const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeDeviceType,
  isBotUserAgent,
  isTrackablePath,
  sanitizeSearchQuery,
  classifyReferrer,
  geoFromHeaders,
  buildEventRow,
} = require("../src/services/analyticsIngest");
const { analyticsEventSchema } = require("../src/validation/analytics.schema");

// ── §12 device normalization ─────────────────────────────────────────
test("normalizeDeviceType: MOBILE / DESKTOP / TABLET / OTHER only", () => {
  assert.equal(
    normalizeDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148"),
    "MOBILE",
  );
  assert.equal(normalizeDeviceType("Mozilla/5.0 (Linux; Android 13; Pixel 7) Mobile Safari"), "MOBILE");
  assert.equal(normalizeDeviceType("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)"), "TABLET");
  assert.equal(normalizeDeviceType("Mozilla/5.0 (Linux; Android 13; SM-T870) Safari"), "TABLET"); // android, no "mobile"
  assert.equal(normalizeDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120"), "DESKTOP");
  assert.equal(normalizeDeviceType("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari"), "DESKTOP");
  assert.equal(normalizeDeviceType(""), "OTHER");
  assert.equal(normalizeDeviceType("something-weird"), "OTHER");
});

test("isBotUserAgent flags common crawlers / tooling", () => {
  assert.equal(isBotUserAgent("Googlebot/2.1 (+http://www.google.com/bot.html)"), true);
  assert.equal(isBotUserAgent("python-requests/2.31.0"), true);
  assert.equal(isBotUserAgent("curl/8.1.2"), true);
  assert.equal(isBotUserAgent("Mozilla/5.0 (Windows NT 10.0) Chrome/120 Safari"), false);
});

// ── §15 admin-route exclusion ────────────────────────────────────────
test("isTrackablePath: /admin and /quote token pages are never website analytics", () => {
  assert.equal(isTrackablePath("/"), true);
  assert.equal(isTrackablePath("/products/eco-polo"), true);
  assert.equal(isTrackablePath("/admin"), false);
  assert.equal(isTrackablePath("/admin/dashboard"), false);
  assert.equal(isTrackablePath("/quote/abcdef"), false);
  assert.equal(isTrackablePath("/api/v1/products"), false);
  assert.equal(isTrackablePath("/health"), false);
  assert.equal(isTrackablePath("relative"), false);
});

// ── §21 search sanitization ──────────────────────────────────────────
test("sanitizeSearchQuery: trims, collapses whitespace, lowercases, bounds length", () => {
  assert.equal(sanitizeSearchQuery("  Lanyard  Printing "), "lanyard printing");
  assert.equal(sanitizeSearchQuery(""), null);
  assert.equal(sanitizeSearchQuery(null), null);
  assert.equal(sanitizeSearchQuery("x".repeat(400)).length, 120);
});

// ── §19 referrer classification ─────────────────────────────────────
test("classifyReferrer: sensible buckets, never fabricates attribution", () => {
  assert.equal(classifyReferrer({}), "Direct");
  assert.equal(classifyReferrer({ referrer: "https://www.google.com/search?q=x" }), "Google/Search");
  assert.equal(classifyReferrer({ referrer: "https://instagram.com/p/abc" }), "Instagram");
  assert.equal(classifyReferrer({ referrer: "https://www.indiamart.com/x" }), "IndiaMART");
  assert.equal(classifyReferrer({ referrer: "https://wa.me/abc" }), "WhatsApp");
  assert.equal(classifyReferrer({ referrer: "https://some-blog.example/post" }), "Other Referral");
  assert.equal(classifyReferrer({ utmSource: "google", utmMedium: "cpc" }), "Google/Search");
  assert.equal(classifyReferrer({ utmSource: "newsletter", utmMedium: "email" }), "Campaign");
});

// ── §10 privacy: geo only from an edge header, raw IP never stored ───
test("geoFromHeaders: uses cf-ipcountry when present, null otherwise", () => {
  assert.deepEqual(geoFromHeaders({}), { country: null, state: null, city: null });
  assert.equal(geoFromHeaders({ "cf-ipcountry": "in" }).country, "IN");
  assert.equal(geoFromHeaders({ "cf-ipcountry": "XX" }).country, null); // Cloudflare "unknown"
  assert.equal(geoFromHeaders({ "x-vercel-ip-country": "US" }).country, "US");
});

test("buildEventRow: never emits a raw-IP field and honours privacy/bot/admin rules", () => {
  const ctx = {
    userAgent: "Mozilla/5.0 (iPhone) Mobile Safari",
    headers: { "cf-ipcountry": "IN", "x-forwarded-for": "203.0.113.9" },
  };
  const row = buildEventRow(
    { eventType: "PRODUCT_VIEW", visitorId: "visitor-123456", sessionId: "sess-123456", path: "/products/x", productId: "p1", productCode: "PL-TS-001" },
    ctx,
  );
  assert.ok(row);
  assert.equal("ip" in row, false);
  assert.equal("rawIp" in row, false);
  assert.equal(row.deviceType, "MOBILE");
  assert.equal(row.country, "IN");
  assert.equal(row.productId, "p1");
  assert.equal(row.productCode, "PL-TS-001");
  assert.equal(row.referrerGroup, "Direct");

  // bot → dropped
  assert.equal(
    buildEventRow({ eventType: "PAGE_VIEW", visitorId: "v-123456", path: "/" }, { userAgent: "Googlebot/2.1" }),
    null,
  );
  // no visitor id → dropped
  assert.equal(buildEventRow({ eventType: "PAGE_VIEW", path: "/" }, ctx), null);
  // admin path → dropped
  assert.equal(
    buildEventRow({ eventType: "PAGE_VIEW", visitorId: "v-123456", path: "/admin/dashboard" }, ctx),
    null,
  );
});

test("buildEventRow: SEARCH keeps a sanitized bounded query + a clamped result count", () => {
  const row = buildEventRow(
    { eventType: "SEARCH", visitorId: "v-123456", path: "/products", searchQuery: "  LANYARD  ", searchResultCount: 0 },
    { userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/120" },
  );
  assert.equal(row.searchQuery, "lanyard");
  assert.equal(row.searchResultCount, 0);
  assert.equal(row.eventType, "SEARCH");
});

// ── §7/§14 payload validation ───────────────────────────────────────
test("analyticsEventSchema: accepts a well-formed event", () => {
  const parsed = analyticsEventSchema.safeParse({
    eventType: "PRODUCT_VIEW",
    visitorId: "visitor-abcdef",
    path: "/products/x",
    productId: "p1",
  });
  assert.equal(parsed.success, true);
});

test("analyticsEventSchema: rejects missing visitorId, bad type, and unknown keys", () => {
  assert.equal(analyticsEventSchema.safeParse({ eventType: "PRODUCT_VIEW" }).success, false);
  assert.equal(
    analyticsEventSchema.safeParse({ eventType: "NOT_A_TYPE", visitorId: "visitor-abcdef" }).success,
    false,
  );
  assert.equal(
    analyticsEventSchema.safeParse({ eventType: "PAGE_VIEW", visitorId: "visitor-abcdef", evil: 1 }).success,
    false,
  );
});
