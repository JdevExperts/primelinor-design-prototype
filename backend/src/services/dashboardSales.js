/**
 * Sales-pipeline aggregation for the dashboard: RFQ + Lead counters,
 * quotation THREAD metrics (§24/§25) and the computed "Needs Attention"
 * queue (§26). All counting is done in the DB; the only rows pulled into
 * Node are the small per-version scalar set needed to fold versions into
 * threads, which has no SQL-only equivalent.
 */
const prisma = require("../lib/prisma");
const { summariseThreads } = require("./quotationThreadMetrics");
const { hasPendingRevisionRequest } = require("./quotationRevisionRules");
const { namedDateRange, queryString } = require("./dashboardPeriods");

/** Deep-link builders — every clickable dashboard number resolves to a
 *  real, backend-supported filtered list (§2/§3/§4/§5/§27). */
function rfqLinks(now) {
  const byStatus = Object.fromEntries(RFQ_STATUSES.map((s) => [s, `/admin/rfqs${queryString({ status: s })}`]));
  return {
    today: `/admin/rfqs${queryString(namedDateRange("today", now))}`,
    week: `/admin/rfqs${queryString(namedDateRange("this-week", now))}`,
    month: `/admin/rfqs${queryString(namedDateRange("this-month", now))}`,
    byStatus,
  };
}
function leadLinks(now) {
  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, `/admin/leads${queryString({ status: s })}`]));
  return {
    today: `/admin/leads${queryString(namedDateRange("today", now))}`,
    week: `/admin/leads${queryString(namedDateRange("this-week", now))}`,
    month: `/admin/leads${queryString(namedDateRange("this-month", now))}`,
    byStatus,
  };
}
function quotationLinks() {
  const base = "/admin/quotations";
  return {
    active: `${base}${queryString({ thread: "active" })}`,
    pendingRevision: `${base}${queryString({ pendingRevision: "1" })}`,
    expired: `${base}${queryString({ expired: "true" })}`,
    byStatus: Object.fromEntries(
      ["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "CANCELLED"].map((s) => [
        s,
        `${base}${queryString({ status: s })}`,
      ]),
    ),
  };
}

const RFQ_STATUSES = ["NEW", "IN_PROGRESS", "QUOTED", "NEGOTIATING", "WON", "LOST", "CANCELLED"];
const LEAD_STATUSES = ["NEW", "IN_REVIEW", "CONVERTED", "CLOSED"];

// ── Needs Attention thresholds (documented, tunable) ──────────────────
const ATTN = {
  sentNotViewedDays: 3, // SENT quote the customer hasn't opened
  viewedNoResponseDays: 5, // VIEWED quote with no accept/decline/revision
  staleRfqDays: 7, // IN_PROGRESS/NEGOTIATING RFQ with no activity
  nearExpiryDays: 3, // live quote whose validUntil is within N days
};

const daysAgo = (n, now) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
const daysAhead = (n, now) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

async function countByCreatedAt(model, from, to) {
  return prisma[model].count({ where: { createdAt: { gte: from, lt: to } } });
}

/** RFQ counters: totals for today/7d/30d + a breakdown by current status. */
async function rfqMetrics({ now, windows }) {
  const [today, week, month, byStatusRaw] = await Promise.all([
    countByCreatedAt("rFQ", windows.today, now),
    countByCreatedAt("rFQ", windows.week, now),
    countByCreatedAt("rFQ", windows.month, now),
    prisma.rFQ.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const byStatus = Object.fromEntries(RFQ_STATUSES.map((s) => [s, 0]));
  for (const r of byStatusRaw) byStatus[r.status] = r._count._all;
  return {
    today,
    week,
    month,
    byStatus,
    total: Object.values(byStatus).reduce((a, b) => a + b, 0),
    links: rfqLinks(now),
  };
}

/** Lead counters — same shape. Uses the existing LeadStatus enum (§23). */
async function leadMetrics({ now, windows }) {
  const [today, week, month, byStatusRaw] = await Promise.all([
    countByCreatedAt("lead", windows.today, now),
    countByCreatedAt("lead", windows.week, now),
    countByCreatedAt("lead", windows.month, now),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
  for (const r of byStatusRaw) byStatus[r.status] = r._count._all;
  return {
    today,
    week,
    month,
    byStatus,
    total: Object.values(byStatus).reduce((a, b) => a + b, 0),
    links: leadLinks(now),
  };
}

/**
 * Load every quotation version as a light scalar row and flag which
 * threads' latest version carries an unresolved customer revision request.
 */
async function loadThreadVersions() {
  const rows = await prisma.quotation.findMany({
    select: {
      id: true,
      quotationGroupId: true,
      version: true,
      status: true,
      grandTotal: true,
      validUntil: true,
      sentAt: true,
      viewedAt: true,
      rfqId: true,
      updatedAt: true,
    },
    orderBy: { version: "asc" },
  });

  // Latest version id per group.
  const latestByGroup = new Map();
  for (const r of rows) {
    const cur = latestByGroup.get(r.quotationGroupId);
    if (!cur || r.version > cur.version) latestByGroup.set(r.quotationGroupId, r);
  }
  const latestIds = [...latestByGroup.values()].map((r) => r.id);

  const pendingIds = new Set();
  if (latestIds.length) {
    const events = await prisma.rFQActivity.findMany({
      where: {
        type: {
          in: [
            "CUSTOMER_REVISION_REQUESTED",
            "REVISION_REQUEST_ADDRESSED",
            "QUOTATION_REVISION_CREATED",
            "QUOTATION_ACCEPTED",
            "QUOTATION_REJECTED",
            "QUOTATION_CANCELLED",
          ],
        },
        OR: [
          { quotationId: { in: latestIds } },
          { AND: [{ quotationId: null }, { metadata: { path: ["quotationId"], not: null } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: { type: true, quotationId: true, metadata: true, createdAt: true },
    });
    const byQuotation = new Map();
    for (const e of events) {
      const qid = e.quotationId || e.metadata?.quotationId;
      if (!qid || !latestIds.includes(qid)) continue;
      const list = byQuotation.get(qid) || [];
      list.push(e);
      byQuotation.set(qid, list);
    }
    for (const [qid, list] of byQuotation) {
      if (hasPendingRevisionRequest(list)) pendingIds.add(qid);
    }
  }

  for (const r of rows) r.pendingRevision = pendingIds.has(r.id);
  return { rows, latestByGroup, latestIds, pendingIds };
}

/** Quotation THREAD metrics (§24). */
async function quotationMetrics({ now }) {
  const { rows } = await loadThreadVersions();
  const s = summariseThreads(rows, now);
  return {
    activeThreads: s.active,
    byStatus: s.byStatus,
    expired: s.expired,
    pendingRevisionRequests: s.pendingRevision,
    totalQuotedValue: s.quotedValue,
    acceptedValue: s.acceptedValue,
    acceptanceRate: s.acceptanceRate, // % of threads that reached the customer and were accepted
    totalThreads: s.totalThreads,
    reachedCustomer: s.reachedCustomer,
    links: quotationLinks(),
  };
}

/**
 * The "Needs Attention" queue (§26). Returns a count per condition plus a
 * total, and the deep-link target for each (§27). Thresholds: see ATTN.
 */
async function needsAttention({ now }) {
  const { rows, latestByGroup, pendingIds } = await loadThreadVersions();
  const latest = [...latestByGroup.values()];

  // NEW RFQs
  const newRfqs = await prisma.rFQ.count({ where: { status: "NEW" } });

  // RFQ IN_PROGRESS / NEGOTIATING with no activity in `staleRfqDays`.
  const openRfqs = await prisma.rFQ.findMany({
    where: { status: { in: ["IN_PROGRESS", "NEGOTIATING"] } },
    select: { id: true, updatedAt: true },
  });
  let staleRfqs = 0;
  if (openRfqs.length) {
    const lastActivity = await prisma.rFQActivity.groupBy({
      by: ["rfqId"],
      where: { rfqId: { in: openRfqs.map((r) => r.id) } },
      _max: { createdAt: true },
    });
    const lastByRfq = new Map(lastActivity.map((a) => [a.rfqId, a._max.createdAt]));
    const cutoff = daysAgo(ATTN.staleRfqDays, now);
    for (const r of openRfqs) {
      const last = lastByRfq.get(r.id) || r.updatedAt;
      if (new Date(last).getTime() < cutoff.getTime()) staleRfqs += 1;
    }
  }

  // Quotation-thread conditions — evaluated on each thread's latest version.
  let incompleteDrafts = 0;
  let sentNotViewed = 0;
  let viewedNoResponse = 0;
  let nearExpiry = 0;
  const draftLineCounts = await draftLinePricing(latest.filter((r) => r.status === "DRAFT").map((r) => r.id));
  const sentCut = daysAgo(ATTN.sentNotViewedDays, now);
  const viewedCut = daysAgo(ATTN.viewedNoResponseDays, now);
  const expiryWindowEnd = daysAhead(ATTN.nearExpiryDays, now);

  for (const r of latest) {
    if (r.status === "DRAFT") {
      const p = draftLineCounts.get(r.id) || { lines: 0, needRate: 0 };
      const total = r.grandTotal == null ? 0 : Number(r.grandTotal);
      if (p.lines === 0 || p.needRate > 0 || total <= 0) incompleteDrafts += 1;
    }
    if (r.status === "SENT" && r.sentAt && new Date(r.sentAt).getTime() < sentCut.getTime()) sentNotViewed += 1;
    if (r.status === "VIEWED" && r.viewedAt && new Date(r.viewedAt).getTime() < viewedCut.getTime()) {
      viewedNoResponse += 1;
    }
    if (
      ["SENT", "VIEWED"].includes(r.status) &&
      r.validUntil &&
      new Date(r.validUntil).getTime() >= now.getTime() &&
      new Date(r.validUntil).getTime() <= expiryWindowEnd.getTime()
    ) {
      nearExpiry += 1;
    }
  }

  const pendingRevisions = pendingIds.size;

  const items = [
    { key: "newRfqs", label: "New RFQs", count: newRfqs, href: "/admin/rfqs?status=NEW" },
    {
      key: "pendingRevisions",
      label: "Pending revision requests",
      count: pendingRevisions,
      href: "/admin/quotations?pendingRevision=1",
    },
    {
      key: "incompleteDrafts",
      label: "Incomplete draft quotations",
      count: incompleteDrafts,
      href: "/admin/quotations?status=DRAFT",
    },
    { key: "sentNotViewed", label: `Sent, unopened >${ATTN.sentNotViewedDays}d`, count: sentNotViewed, href: "/admin/quotations?status=SENT" },
    {
      key: "viewedNoResponse",
      label: `Viewed, no reply >${ATTN.viewedNoResponseDays}d`,
      count: viewedNoResponse,
      href: "/admin/quotations?status=VIEWED",
    },
    { key: "staleRfqs", label: `RFQ stalled >${ATTN.staleRfqDays}d`, count: staleRfqs, href: "/admin/rfqs?status=NEGOTIATING" },
    { key: "nearExpiry", label: `Quotes expiring ≤${ATTN.nearExpiryDays}d`, count: nearExpiry, href: "/admin/quotations" },
  ];
  return { items, total: items.reduce((a, b) => a + b.count, 0), thresholds: ATTN };
}

/** For each DRAFT quotation id, how many lines it has and how many still need a rate. */
async function draftLinePricing(ids) {
  const map = new Map();
  if (!ids.length) return map;
  const lines = await prisma.quotationLine.findMany({
    where: { quotationId: { in: ids } },
    select: { quotationId: true, lineType: true, quantity: true, unitPrice: true, lineTotal: true },
  });
  for (const id of ids) map.set(id, { lines: 0, needRate: 0 });
  for (const l of lines) {
    const e = map.get(l.quotationId);
    e.lines += 1;
    const needsRate =
      (l.lineType === "PRODUCT" || l.lineType === "SHIPPING") &&
      l.lineTotal == null &&
      !(l.quantity != null && l.unitPrice != null);
    if (needsRate) e.needRate += 1;
  }
  return map;
}

module.exports = {
  RFQ_STATUSES,
  LEAD_STATUSES,
  ATTN,
  rfqMetrics,
  leadMetrics,
  quotationMetrics,
  needsAttention,
  loadThreadVersions,
};
