/**
 * Pure period/window helpers for the Admin dashboard. A "period" token
 * from the client resolves to a concrete [from, to) window plus the
 * immediately-preceding window of equal length for comparison (§35).
 */

const PERIODS = {
  today: 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

/**
 * @param {string} token  one of: today | 7d | 30d | 90d
 * @param {Date}   now
 * @returns {{ token, days, from, to, prevFrom, prevTo }}
 *   `to` is exclusive (now). `today` = since local-ish midnight of `now`.
 */
function resolvePeriod(token = "7d", now = new Date()) {
  const key = PERIODS[token] ? token : "7d";
  const to = new Date(now);

  let from;
  if (key === "today") {
    from = new Date(now);
    from.setHours(0, 0, 0, 0);
  } else {
    from = new Date(now.getTime() - PERIODS[key] * 24 * 60 * 60 * 1000);
  }

  const spanMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime());
  const prevFrom = new Date(from.getTime() - spanMs);

  return { token: key, days: PERIODS[key], from, to, prevFrom, prevTo };
}

/**
 * Period-over-period change. Returns null (not Infinity) when there is no
 * baseline, so the UI shows "New" rather than a meaningless percentage
 * (§35).
 */
function pctChange(current, previous) {
  const cur = Number(current) || 0;
  const prev = Number(previous) || 0;
  if (prev === 0) return cur === 0 ? 0 : null;
  return Math.round(((cur - prev) / prev) * 100);
}

/**
 * Inclusive list of UTC calendar days ['YYYY-MM-DD', …] spanning
 * [from, to] — used to gap-fill a trend series so days with no traffic
 * still render. UTC throughout so it matches Postgres `date_trunc('day')`.
 */
function dayBuckets(from, to) {
  const out = [];
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
  while (cursor <= end) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

/**
 * A named calendar range → `{ dateFrom, dateTo }` ISO strings, for
 * building deep-links to the RFQ/Lead admin lists (which already accept
 * `dateFrom`/`dateTo`). `today` = local midnight → now; `this-week` = last
 * 7 days; `this-month` = last 30 days — matching the dashboard's own
 * "Today / This Week / This Month" counters.
 */
function namedDateRange(kind, now = new Date()) {
  const to = new Date(now);
  const from = new Date(now);
  if (kind === "today") {
    from.setHours(0, 0, 0, 0);
  } else if (kind === "this-week") {
    from.setDate(from.getDate() - 7);
  } else if (kind === "this-month") {
    from.setDate(from.getDate() - 30);
  } else {
    return null;
  }
  return { dateFrom: from.toISOString(), dateTo: to.toISOString() };
}

/** Build a query-string from a plain object, skipping empty values. */
function queryString(params) {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

// Period tokens usable as an admin-list filter (`?period=`). "all" = no
// window. Everything else is a trailing N calendar days ("today" = since
// local midnight).
const LIST_PERIODS = ["today", "7d", "30d", "90d", "1y", "all"];
const DEFAULT_LIST_PERIOD = "30d";

/**
 * A `?period=` token → a Prisma `createdAt` range `{ gte, lt }`, or `null`
 * for "all" / unknown. `lt` is exclusive (now). `1y` = the same calendar
 * date one year earlier.
 */
function periodRange(token, now = new Date()) {
  if (!token || token === "all") return null;
  const to = new Date(now);
  const from = new Date(now);
  if (token === "today") {
    from.setHours(0, 0, 0, 0);
  } else if (token === "7d") {
    from.setDate(from.getDate() - 7);
  } else if (token === "30d") {
    from.setDate(from.getDate() - 30);
  } else if (token === "90d") {
    from.setDate(from.getDate() - 90);
  } else if (token === "1y") {
    from.setFullYear(from.getFullYear() - 1);
  } else {
    return null;
  }
  return { gte: from, lt: to };
}

module.exports = {
  PERIODS,
  LIST_PERIODS,
  DEFAULT_LIST_PERIOD,
  resolvePeriod,
  pctChange,
  dayBuckets,
  namedDateRange,
  queryString,
  periodRange,
};
