/**
 * PostgreSQL-side aggregation for the dashboard's Website + analytics
 * views. Every function runs its counting in the database (COUNT/GROUP
 * BY / DISTINCT) — no service ever pulls raw AnalyticsEvent rows into
 * Node to reduce them (§37).
 */
const prisma = require("../lib/prisma");

// Dashboards ignore `is_test` rows in production. In dev/QA, set
// ANALYTICS_DASHBOARD_INCLUDE_TEST=1 to view seeded sample data.
const INCLUDE_TEST = process.env.ANALYTICS_DASHBOARD_INCLUDE_TEST === "1";

const num = (v) => (v == null ? 0 : Number(v));

/** Headline website counters for a [from, to) window. */
async function websiteSummary({ from, to }) {
  const [row] = await prisma.$queryRaw`
    SELECT
      COUNT(DISTINCT visitor_id)                                              AS visitors,
      COUNT(DISTINCT session_id)                                              AS sessions,
      COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW')                        AS page_views,
      COUNT(*) FILTER (WHERE event_type = 'PRODUCT_VIEW')                     AS product_views,
      COUNT(*) FILTER (WHERE event_type = 'PRODUCT_CARD_CLICK')              AS product_card_clicks,
      COUNT(*) FILTER (WHERE event_type = 'CATEGORY_VIEW')                    AS category_views,
      COUNT(*) FILTER (WHERE event_type = 'SOLUTION_VIEW')                    AS solution_views,
      COUNT(*) FILTER (WHERE event_type = 'SEARCH')                          AS searches,
      COUNT(*) FILTER (WHERE event_type = 'QUOTE_CTA_CLICK')                  AS quote_cta_clicks,
      COUNT(*) FILTER (WHERE event_type = 'RFQ_STARTED')                      AS rfq_starts,
      COUNT(*) FILTER (WHERE event_type = 'RFQ_SUBMITTED')                    AS rfq_submissions,
      COUNT(*) FILTER (WHERE event_type = 'WHATSAPP_CLICK')                   AS whatsapp_clicks,
      COUNT(*) FILTER (WHERE event_type = 'CONTACT_CLICK')                    AS contact_clicks
    FROM analytics_events
    WHERE created_at >= ${from} AND created_at < ${to} AND (is_test = false OR ${INCLUDE_TEST})`;
  return {
    visitors: num(row.visitors),
    sessions: num(row.sessions),
    pageViews: num(row.page_views),
    productViews: num(row.product_views),
    productCardClicks: num(row.product_card_clicks),
    categoryViews: num(row.category_views),
    solutionViews: num(row.solution_views),
    searches: num(row.searches),
    quoteCtaClicks: num(row.quote_cta_clicks),
    rfqStarts: num(row.rfq_starts),
    rfqSubmissions: num(row.rfq_submissions),
    whatsappClicks: num(row.whatsapp_clicks),
    contactClicks: num(row.contact_clicks),
  };
}

/** Daily [{ date, visitors, pageViews }] across the window (gap-filled by the caller/UI). */
async function trafficTrend({ from, to }) {
  const rows = await prisma.$queryRaw`
    SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
           COUNT(DISTINCT visitor_id)                            AS visitors,
           COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW')      AS page_views
    FROM analytics_events
    WHERE created_at >= ${from} AND created_at < ${to} AND (is_test = false OR ${INCLUDE_TEST})
    GROUP BY 1 ORDER BY 1`;
  return rows.map((r) => ({ date: r.date, visitors: num(r.visitors), pageViews: num(r.page_views) }));
}

/** Visitor share by device category (§12). */
async function deviceBreakdown({ from, to }) {
  const rows = await prisma.$queryRaw`
    SELECT COALESCE(device_type, 'OTHER') AS device_type,
           COUNT(DISTINCT visitor_id)     AS visitors
    FROM analytics_events
    WHERE created_at >= ${from} AND created_at < ${to} AND (is_test = false OR ${INCLUDE_TEST})
    GROUP BY 1`;
  const map = { MOBILE: 0, DESKTOP: 0, TABLET: 0, OTHER: 0 };
  for (const r of rows) map[r.device_type] = num(r.visitors);
  const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
  return {
    counts: map,
    percent: {
      MOBILE: Math.round((map.MOBILE / total) * 1000) / 10,
      DESKTOP: Math.round((map.DESKTOP / total) * 1000) / 10,
      TABLET: Math.round((map.TABLET / total) * 1000) / 10,
      OTHER: Math.round((map.OTHER / total) * 1000) / 10,
    },
  };
}

/** Acquisition buckets (§19) — visitor counts per referrer group. */
async function referrerBreakdown({ from, to }) {
  const rows = await prisma.$queryRaw`
    SELECT COALESCE(referrer_group, 'Direct') AS grp,
           COUNT(DISTINCT visitor_id)         AS visitors
    FROM analytics_events
    WHERE created_at >= ${from} AND created_at < ${to} AND (is_test = false OR ${INCLUDE_TEST})
    GROUP BY 1 ORDER BY 2 DESC`;
  return rows.map((r) => ({ source: r.grp, visitors: num(r.visitors) }));
}

/** Top public pages by views (§20). */
async function topPages({ from, to, limit = 12 }) {
  const rows = await prisma.$queryRaw`
    SELECT path,
           COUNT(*)                    AS views,
           COUNT(DISTINCT visitor_id)  AS unique_visitors
    FROM analytics_events
    WHERE event_type = 'PAGE_VIEW' AND path IS NOT NULL
      AND created_at >= ${from} AND created_at < ${to} AND (is_test = false OR ${INCLUDE_TEST})
    GROUP BY 1 ORDER BY 2 DESC LIMIT ${limit}`;
  return rows.map((r) => ({ path: r.path, views: num(r.views), uniqueVisitors: num(r.unique_visitors) }));
}

/** Top searches + zero-result searches (§21). */
async function searchAnalytics({ from, to, limit = 15 }) {
  const base = prisma.$queryRaw`
    SELECT search_query                                             AS query,
           COUNT(*)                                                 AS searches,
           COALESCE(MAX(search_result_count), 0)                    AS last_result_count,
           COUNT(*) FILTER (WHERE COALESCE(search_result_count, 0) = 0) AS zero_result_hits
    FROM analytics_events
    WHERE event_type = 'SEARCH' AND search_query IS NOT NULL AND search_query <> ''
      AND created_at >= ${from} AND created_at < ${to} AND (is_test = false OR ${INCLUDE_TEST})
    GROUP BY 1`;
  const rows = await base;
  const top = rows
    .map((r) => ({
      query: r.query,
      searches: num(r.searches),
      lastResultCount: num(r.last_result_count),
      zeroResultHits: num(r.zero_result_hits),
    }))
    .sort((a, b) => b.searches - a.searches);
  return {
    top: top.slice(0, limit),
    zeroResult: top
      .filter((r) => r.lastResultCount === 0 || r.zeroResultHits === r.searches)
      .sort((a, b) => b.searches - a.searches)
      .slice(0, limit),
  };
}

/** Approximate geography (§11). Fields are null unless an edge geo header was present at ingest. */
async function geoBreakdown({ from, to, limit = 8 }) {
  const [cities, states, countries] = await Promise.all([
    prisma.$queryRaw`
      SELECT city, COUNT(DISTINCT visitor_id) AS visitors FROM analytics_events
      WHERE city IS NOT NULL AND created_at >= ${from} AND created_at < ${to} AND (is_test = false OR ${INCLUDE_TEST})
      GROUP BY 1 ORDER BY 2 DESC LIMIT ${limit}`,
    prisma.$queryRaw`
      SELECT state, COUNT(DISTINCT visitor_id) AS visitors FROM analytics_events
      WHERE state IS NOT NULL AND created_at >= ${from} AND created_at < ${to} AND (is_test = false OR ${INCLUDE_TEST})
      GROUP BY 1 ORDER BY 2 DESC LIMIT ${limit}`,
    prisma.$queryRaw`
      SELECT country, COUNT(DISTINCT visitor_id) AS visitors FROM analytics_events
      WHERE country IS NOT NULL AND created_at >= ${from} AND created_at < ${to} AND (is_test = false OR ${INCLUDE_TEST})
      GROUP BY 1 ORDER BY 2 DESC LIMIT ${limit}`,
  ]);
  const shape = (rows, key) => rows.map((r) => ({ name: r[key], visitors: num(r.visitors) }));
  const topCities = shape(cities, "city");
  const topStates = shape(states, "state");
  const topCountries = shape(countries, "country");
  return {
    hasGeo: topCities.length + topStates.length + topCountries.length > 0,
    topCities,
    topStates,
    topCountries,
  };
}

/** Distinct-visitor count only, for funnel/period-comparison headline numbers. */
async function visitorCount({ from, to }) {
  const [row] = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT visitor_id) AS visitors
    FROM analytics_events
    WHERE created_at >= ${from} AND created_at < ${to} AND (is_test = false OR ${INCLUDE_TEST})`;
  return num(row.visitors);
}

/** Per-event counts keyed by type for a window (used by product performance + funnel). */
async function eventCountsByType({ from, to }) {
  const rows = await prisma.$queryRaw`
    SELECT event_type, COUNT(*) AS n
    FROM analytics_events
    WHERE created_at >= ${from} AND created_at < ${to} AND (is_test = false OR ${INCLUDE_TEST})
    GROUP BY 1`;
  const map = {};
  for (const r of rows) map[r.event_type] = num(r.n);
  return map;
}

/** Views + quote-CTA clicks per productId in a window (product performance). */
async function productEventCounts({ from, to }) {
  const rows = await prisma.$queryRaw`
    SELECT product_id,
           COUNT(*) FILTER (WHERE event_type = 'PRODUCT_VIEW')      AS views,
           COUNT(*) FILTER (WHERE event_type = 'PRODUCT_CARD_CLICK') AS card_clicks,
           COUNT(*) FILTER (WHERE event_type = 'QUOTE_CTA_CLICK')    AS quote_cta_clicks
    FROM analytics_events
    WHERE product_id IS NOT NULL
      AND created_at >= ${from} AND created_at < ${to} AND (is_test = false OR ${INCLUDE_TEST})
    GROUP BY 1`;
  const map = new Map();
  for (const r of rows) {
    map.set(r.product_id, {
      views: num(r.views),
      cardClicks: num(r.card_clicks),
      quoteCtaClicks: num(r.quote_cta_clicks),
    });
  }
  return map;
}

module.exports = {
  websiteSummary,
  trafficTrend,
  deviceBreakdown,
  referrerBreakdown,
  topPages,
  searchAnalytics,
  geoBreakdown,
  visitorCount,
  eventCountsByType,
  productEventCounts,
};
