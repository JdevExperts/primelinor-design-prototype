/**
 * Composes the per-section dashboard payloads from the aggregation
 * services. Kept separate from the controller so the assembly logic is
 * testable and the controller stays a thin HTTP shell.
 */
const prisma = require("../lib/prisma");
const { resolvePeriod, pctChange } = require("./dashboardPeriods");
const analytics = require("./analyticsQuery");
const { rfqMetrics, leadMetrics, quotationMetrics, needsAttention } = require("./dashboardSales");
const { catalogueHealth } = require("./catalogueHealth");
const { productPerformance } = require("./productPerformance");

function windowsFor(now) {
  return {
    today: (() => {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    })(),
    week: new Date(now.getTime() - 7 * 864e5),
    month: new Date(now.getTime() - 30 * 864e5),
  };
}

async function rfqCount(from, to) {
  return prisma.rFQ.count({ where: { createdAt: { gte: from, lt: to } } });
}
async function acceptedThreadCount(from, to) {
  const rows = await prisma.quotation.findMany({
    where: { status: "ACCEPTED", respondedAt: { gte: from, lt: to } },
    select: { quotationGroupId: true },
    distinct: ["quotationGroupId"],
  });
  return rows.length;
}
async function sentThreadCount(from, to) {
  const rows = await prisma.quotation.findMany({
    where: { sentAt: { gte: from, lt: to } },
    select: { quotationGroupId: true },
    distinct: ["quotationGroupId"],
  });
  return rows.length;
}

/** Visitors → Product Views → Quote CTA → RFQ Submitted → Quotations Sent → Accepted. */
async function aggregateFunnel(period) {
  const { from, to } = period;
  const [web, rfqs, sent, accepted] = await Promise.all([
    analytics.websiteSummary({ from, to }),
    rfqCount(from, to),
    sentThreadCount(from, to),
    acceptedThreadCount(from, to),
  ]);
  return {
    label: "Aggregate Funnel",
    note: "Stage totals for the period — not person-by-person conversion.",
    stages: [
      { key: "visitors", label: "Visitors", value: web.visitors },
      { key: "productViews", label: "Product Views", value: web.productViews },
      { key: "quoteCta", label: "Quote CTA Clicks", value: web.quoteCtaClicks },
      { key: "rfqSubmitted", label: "RFQ Submitted", value: rfqs },
      { key: "quotationsSent", label: "Quotations Sent", value: sent },
      { key: "accepted", label: "Accepted", value: accepted },
    ],
  };
}

async function overview({ period = "7d", now = new Date() } = {}) {
  const p = resolvePeriod(period, now);
  const windows = windowsFor(now);

  const [web, webPrev, rfq, lead, quotes, attention, health, funnel, rfqPrev, acceptedNow, acceptedPrev] =
    await Promise.all([
      analytics.websiteSummary({ from: p.from, to: p.to }),
      analytics.websiteSummary({ from: p.prevFrom, to: p.prevTo }),
      rfqMetrics({ now, windows }),
      leadMetrics({ now, windows }),
      quotationMetrics({ now }),
      needsAttention({ now }),
      catalogueHealth(),
      aggregateFunnel(p),
      rfqCount(p.prevFrom, p.prevTo),
      acceptedThreadCount(p.from, p.to),
      acceptedThreadCount(p.prevFrom, p.prevTo),
    ]);

  const rfqNow = await rfqCount(p.from, p.to);

  const card = (label, value, prev) => ({ label, value, prev, changePct: pctChange(value, prev) });

  return {
    period: { token: p.token, from: p.from, to: p.to },
    topCards: [
      card("Website Visitors", web.visitors, webPrev.visitors),
      card("Product Views", web.productViews, webPrev.productViews),
      card("RFQs", rfqNow, rfqPrev),
      card("Accepted Quotations", acceptedNow, acceptedPrev),
    ],
    attentionRow: [
      { label: "New RFQs", value: rfq.byStatus.NEW, href: "/admin/rfqs?status=NEW" },
      {
        label: "Pending Revision Requests",
        value: quotes.pendingRevisionRequests,
        href: "/admin/quotations?pendingRevision=1",
      },
      { label: "Follow-ups Needed", value: attention.total, href: "/admin/dashboard/sales" },
      { label: "Catalogue Issues", value: health.totalIssues, href: "/admin/dashboard/catalogue-health" },
    ],
    quotations: quotes,
    needsAttention: attention,
    funnel,
    catalogueHealthSummary: {
      totalIssues: health.totalIssues,
      productsWithIssues: health.productsWithIssues,
      totals: health.totals,
      review: health.review,
    },
    leads: { today: lead.today, week: lead.week, month: lead.month },
  };
}

async function website({ period = "7d", now = new Date() } = {}) {
  const p = resolvePeriod(period, now);
  const [summary, prev, trend, device, referrers, pages, search, geo, funnel] = await Promise.all([
    analytics.websiteSummary({ from: p.from, to: p.to }),
    analytics.websiteSummary({ from: p.prevFrom, to: p.prevTo }),
    analytics.trafficTrend({ from: p.from, to: p.to }),
    analytics.deviceBreakdown({ from: p.from, to: p.to }),
    analytics.referrerBreakdown({ from: p.from, to: p.to }),
    analytics.topPages({ from: p.from, to: p.to }),
    analytics.searchAnalytics({ from: p.from, to: p.to }),
    analytics.geoBreakdown({ from: p.from, to: p.to }),
    aggregateFunnel(p),
  ]);
  const metricKeys = [
    ["visitors", "Visitors"],
    ["sessions", "Sessions"],
    ["pageViews", "Page Views"],
    ["productViews", "Product Views"],
    ["quoteCtaClicks", "Quote CTA Clicks"],
    ["rfqStarts", "RFQ Starts"],
    ["rfqSubmissions", "RFQ Submissions"],
    ["whatsappClicks", "WhatsApp Clicks"],
    ["contactClicks", "Contact Clicks"],
  ];
  return {
    period: { token: p.token, from: p.from, to: p.to },
    metrics: metricKeys.map(([k, label]) => ({
      key: k,
      label,
      value: summary[k],
      prev: prev[k],
      changePct: pctChange(summary[k], prev[k]),
    })),
    trafficTrend: trend,
    device,
    referrers,
    topPages: pages,
    search,
    geo,
    funnel,
  };
}

async function sales({ period = "7d", now = new Date() } = {}) {
  const p = resolvePeriod(period, now);
  const windows = windowsFor(now);
  const [rfq, lead, quotes, attention, trend] = await Promise.all([
    rfqMetrics({ now, windows }),
    leadMetrics({ now, windows }),
    quotationMetrics({ now }),
    needsAttention({ now }),
    salesTrend(p),
  ]);
  return {
    period: { token: p.token, from: p.from, to: p.to },
    rfq,
    lead,
    quotations: quotes,
    needsAttention: attention,
    trend,
    trendSemantics:
      "Leads by Lead.createdAt, RFQs by RFQ.createdAt. Quotes Sent = quotation threads (quotationGroupId) counted on the day their first version was sent — a later revision re-send is not a new opportunity.",
  };
}

/** Daily RFQ submissions + quotations sent across the period. */
/**
 * Daily three-series trend (§14/§15): Leads created (Lead.createdAt),
 * RFQs created (RFQ.createdAt), and **Quotation threads first sent** on
 * that day — a `quotationGroupId` counts on the day its EARLIEST `sentAt`
 * falls, so a V2/V3 re-send is never counted as a new opportunity. This
 * is "Quotes Sent" = quotation threads that reached the customer.
 */
async function salesTrend({ from, to }) {
  const rows = await prisma.$queryRaw`
    WITH thread_first_sent AS (
      SELECT quotation_group_id, MIN(sent_at) AS first_sent
      FROM quotations WHERE sent_at IS NOT NULL
      GROUP BY quotation_group_id
    )
    SELECT d::date::text AS date,
      (SELECT COUNT(*) FROM leads l WHERE l.created_at >= d AND l.created_at < d + interval '1 day')  AS leads,
      (SELECT COUNT(*) FROM rfqs r  WHERE r.created_at >= d AND r.created_at < d + interval '1 day')  AS rfqs,
      (SELECT COUNT(*) FROM thread_first_sent t
         WHERE t.first_sent >= d AND t.first_sent < d + interval '1 day')                             AS quotes_sent
    FROM generate_series(date_trunc('day', ${from}::timestamp), ${to}::timestamp, interval '1 day') d
    ORDER BY 1`;
  return rows.map((r) => ({
    date: r.date,
    leads: Number(r.leads || 0),
    rfqs: Number(r.rfqs || 0),
    quotesSent: Number(r.quotes_sent || 0),
  }));
}

async function products({ period = "30d", now = new Date() } = {}) {
  const p = resolvePeriod(period, now);
  return { period: { token: p.token, from: p.from, to: p.to }, ...(await productPerformance({ from: p.from, to: p.to })) };
}

module.exports = { overview, website, sales, products, catalogueHealth, aggregateFunnel };
