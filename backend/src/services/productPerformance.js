/**
 * Product Performance (§30–§33). Value attribution follows §32 strictly:
 * only PRODUCT quotation lines are attributed, to their own productId, at
 * their own lineTotal — never the quotation grand total, and shipping /
 * discount / adjustment lines are ignored so they can't be double-counted
 * as product revenue.
 *
 * `foldProductQuotationLines` is pure and unit-tested; the DB function
 * assembles it with analytics event counts and RFQ attribution.
 */
const prisma = require("../lib/prisma");
const { productEventCounts } = require("./analyticsQuery");

const SENT_OR_LATER = new Set(["SENT", "VIEWED", "ACCEPTED", "REJECTED"]);

/**
 * @param {Array} lines  every PRODUCT quotation line with a productId:
 *   { productId, quotationGroupId, version, status, lineTotal }
 * @returns {Map<productId, { quotationThreads, acceptedThreads, quotedValue, acceptedValue }>}
 */
function foldProductQuotationLines(lines) {
  // productId -> groupId -> { versions: Map<version,{status,amount}>, hasAccepted }
  const byProduct = new Map();
  for (const l of lines || []) {
    if (!l.productId) continue;
    const groups = byProduct.get(l.productId) || new Map();
    const g = groups.get(l.quotationGroupId) || { versions: new Map() };
    const v = g.versions.get(l.version) || { status: l.status, amount: 0 };
    v.amount += l.lineTotal == null ? 0 : Number(l.lineTotal);
    v.status = l.status;
    g.versions.set(l.version, v);
    groups.set(l.quotationGroupId, g);
    byProduct.set(l.productId, groups);
  }

  const out = new Map();
  for (const [productId, groups] of byProduct) {
    let acceptedThreads = 0;
    let quotedValue = 0;
    let acceptedValue = 0;
    for (const g of groups.values()) {
      const entries = [...g.versions.entries()].sort((a, b) => b[0] - a[0]); // version desc
      const acceptedV = entries.find(([, v]) => v.status === "ACCEPTED");
      if (acceptedV) {
        acceptedThreads += 1;
        acceptedValue += acceptedV[1].amount;
      }
      const lastSentV = entries.find(([, v]) => SENT_OR_LATER.has(v.status));
      if (lastSentV) quotedValue += lastSentV[1].amount;
    }
    out.set(productId, {
      quotationThreads: groups.size,
      acceptedThreads,
      quotedValue: Math.round(quotedValue * 100) / 100,
      acceptedValue: Math.round(acceptedValue * 100) / 100,
    });
  }
  return out;
}

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : null);

async function productPerformance({ from, to, limit = 25, minViewsForConversion = 20 }) {
  const [products, eventMap, quotationLines, rfqItems] = await Promise.all([
    prisma.product.findMany({ select: { id: true, slug: true, productCode: true, name: true, active: true } }),
    productEventCounts({ from, to }),
    // All-time PRODUCT quotation lines (thread/value metrics are low-volume
    // and more meaningful un-windowed — documented in the report).
    prisma.quotationLine.findMany({
      where: { lineType: "PRODUCT", productId: { not: null } },
      select: {
        productId: true,
        lineTotal: true,
        quotation: { select: { quotationGroupId: true, version: true, status: true } },
      },
    }),
    // RFQ attribution (§31): a distinct RFQ counts once per product it
    // contains, over the selected window.
    prisma.rFQItem.findMany({
      where: { productId: { not: null }, rfq: { createdAt: { gte: from, lt: to } } },
      select: { productId: true, rfqId: true },
    }),
  ]);

  const folded = foldProductQuotationLines(
    quotationLines.map((l) => ({
      productId: l.productId,
      quotationGroupId: l.quotation.quotationGroupId,
      version: l.quotation.version,
      status: l.quotation.status,
      lineTotal: l.lineTotal,
    })),
  );

  const rfqByProduct = new Map();
  for (const it of rfqItems) {
    const set = rfqByProduct.get(it.productId) || new Set();
    set.add(it.rfqId);
    rfqByProduct.set(it.productId, set);
  }

  const rows = products.map((p) => {
    const ev = eventMap.get(p.id) || { views: 0, cardClicks: 0, quoteCtaClicks: 0 };
    const q = folded.get(p.id) || { quotationThreads: 0, acceptedThreads: 0, quotedValue: 0, acceptedValue: 0 };
    const rfqs = (rfqByProduct.get(p.id) || new Set()).size;
    return {
      productId: p.id,
      slug: p.slug,
      productCode: p.productCode,
      name: p.name,
      active: p.active,
      views: ev.views,
      cardClicks: ev.cardClicks,
      quoteCtaClicks: ev.quoteCtaClicks,
      rfqs,
      quotationThreads: q.quotationThreads,
      acceptedQuotations: q.acceptedThreads,
      quotedValue: q.quotedValue,
      acceptedValue: q.acceptedValue,
      viewToRfqPct: pct(rfqs, ev.views),
      rfqToAcceptedPct: pct(q.acceptedThreads, rfqs),
    };
  });

  const withActivity = rows.filter(
    (r) => r.views || r.rfqs || r.quotationThreads || r.quoteCtaClicks || r.acceptedValue,
  );

  const top = (key, n = limit) =>
    withActivity.slice().sort((a, b) => (b[key] || 0) - (a[key] || 0)).slice(0, n);

  return {
    window: { from, to },
    note:
      "Views / card clicks / quote-CTA clicks / RFQs are for the selected period. Quotation threads, accepted quotations and quoted/accepted value are all-time and use product-line amounts only (§32).",
    products: withActivity.sort((a, b) => b.views - a.views).slice(0, limit),
    rankings: {
      mostViewed: top("views"),
      mostRfqd: top("rfqs"),
      mostAccepted: top("acceptedQuotations"),
      highestAcceptedValue: top("acceptedValue"),
      bestViewToRfq: withActivity
        .filter((r) => r.views >= minViewsForConversion && r.viewToRfqPct != null)
        .sort((a, b) => b.viewToRfqPct - a.viewToRfqPct)
        .slice(0, limit),
    },
    minViewsForConversion,
  };
}

module.exports = { foldProductQuotationLines, productPerformance };
