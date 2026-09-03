/* PHASE 6C-2 — READ-ONLY pre-production audit. No writes. */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const j = (x) => JSON.stringify(x, (k, v) => (typeof v === 'bigint' ? Number(v) : v), 2);

async function main() {
  const out = {};

  // ---- Top-level counts ----
  out.counts = {
    companies: await p.company.count(),
    contacts: await p.contact.count(),
    leads: await p.lead.count(),
    rfqs: await p.rFQ.count(),
    rfqItems: await p.rFQItem.count(),
    rfqWorkingItems: await p.rfqWorkingItem.count(),
    rfqActivity: await p.rFQActivity.count(),
    artworkAssets: await p.artworkAsset.count(),
    quotations: await p.quotation.count(),
    quotationLines: await p.quotationLine.count(),
    internalNotes: await p.internalNote.count(),
    analyticsEvents: await p.analyticsEvent.count(),
    analyticsEventsTest: await p.analyticsEvent.count({ where: { isTest: true } }),
    staffUsers: await p.staffUser.count(),
    products: await p.product.count(),
    categories: await p.category.count(),
    solutions: await p.solution.count(),
    productCategory: await p.productCategory.count(),
    solutionProduct: await p.solutionProduct.count(),
    productAttributeConfig: await p.productAttributeConfig.count(),
    productAttribute: await p.productAttribute.count(),
    colors: await p.color.count(),
    productAssets: await p.productAsset.count(),
  };

  // ---- Contacts (full dump — small operational table) ----
  out.contacts = await p.contact.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, name: true, phone: true, phoneRaw: true, email: true,
      companyNameRaw: true, createdAt: true,
      _count: { select: { leads: true, rfqs: true } },
    },
  });

  // ---- Companies ----
  out.companies = await p.company.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, domain: true, createdAt: true, _count: { select: { contacts: true } } },
  });

  // ---- Leads ----
  out.leads = await p.lead.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, reference: true, status: true, sourceType: true, sourcePath: true,
      message: true, convertedRfqId: true, createdAt: true,
      contact: { select: { id: true, name: true, email: true, phone: true } },
      _count: { select: { rfqs: true } },
    },
  });

  // ---- RFQs ----
  out.rfqs = await p.rFQ.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, reference: true, status: true, sourceType: true, sourcePath: true,
      message: true, deliveryCity: true, deliveryPin: true, leadId: true, createdAt: true,
      contact: { select: { id: true, name: true, email: true, phone: true } },
      _count: { select: { items: true, workingItems: true, activity: true, notes: true, quotations: true } },
    },
  });

  // ---- Quotations ----
  out.quotations = await p.quotation.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, originType: true, originDetail: true, rfqId: true, quotationGroupId: true,
      groupReference: true, version: true, status: true, grandTotal: true,
      partyName: true, partyContactPerson: true, partyPhone: true, partyEmail: true,
      supersedesId: true, accessTokenHash: true, sentAt: true, createdAt: true,
      createdBy: { select: { id: true, name: true, email: true } },
      _count: { select: { lines: true, activity: true, internalNotes: true } },
    },
  });

  // group by quotationGroupId
  const groups = {};
  for (const q of out.quotations) {
    (groups[q.quotationGroupId] ||= []).push(q.version);
  }
  out.quotationGroups = Object.entries(groups).map(([gid, versions]) => ({ quotationGroupId: gid, versions: versions.sort((a, b) => a - b), count: versions.length }));

  // ---- Internal notes ----
  out.internalNotes = await p.internalNote.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, rfqId: true, quotationId: true, body: true, createdAt: true, author: { select: { name: true, email: true } } },
  });

  // ---- RFQ activity type breakdown ----
  out.rfqActivityByType = await p.rFQActivity.groupBy({ by: ['type', 'actorType'], _count: true });

  // ---- Artwork ----
  out.artworkAssets = await p.artworkAsset.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, status: true, originalFileName: true, mimeType: true, size: true, storageKey: true, rfqItemId: true, createdAt: true },
  });

  // ---- Staff users (NO password hash) ----
  out.staffUsers = await p.staffUser.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, name: true, email: true, role: true, active: true,
      createdAt: true, lastLoginAt: true,
      passwordHash: true, // to inspect prefix only — redacted below
      _count: { select: { assignedRfqs: true, internalNotes: true, quotationsCreated: true, productsCreated: true, productsUpdated: true } },
    },
  });
  out.staffUsers = out.staffUsers.map((u) => ({
    ...u,
    passwordHash: undefined,
    passwordHashInfo: u.passwordHash
      ? { prefix: String(u.passwordHash).slice(0, 7), length: String(u.passwordHash).length, looksBcrypt: /^\$2[aby]\$/.test(u.passwordHash) }
      : null,
  }));

  // ---- Analytics ----
  out.analyticsByType = await p.analyticsEvent.groupBy({ by: ['eventType', 'isTest'], _count: true });
  const aFirst = await p.analyticsEvent.findFirst({ orderBy: { createdAt: 'asc' }, select: { createdAt: true } });
  const aLast = await p.analyticsEvent.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } });
  out.analyticsRange = { first: aFirst?.createdAt || null, last: aLast?.createdAt || null };

  // ---- Product Attribute framework ----
  out.productAttributeConfigs = await p.productAttributeConfig.findMany({
    select: { id: true, key: true, name: true, valueType: true, description: true, _count: { select: { attributes: true } } },
  });
  // Review flag breakdown
  const reviewCfg = await p.productAttributeConfig.findFirst({ where: { key: 'PRODUCT_REVIEW_PENDING' } });
  if (reviewCfg) {
    const attrs = await p.productAttribute.findMany({ where: { attributeId: reviewCfg.id }, select: { productId: true, value: true } });
    let pendingTrue = 0, pendingFalse = 0, other = 0;
    for (const a of attrs) {
      if (a.value === true) pendingTrue++;
      else if (a.value === false) pendingFalse++;
      else other++;
    }
    out.productReview = {
      configId: reviewCfg.id,
      totalProducts: out.counts.products,
      attributeRows: attrs.length,
      pendingReview_valueTrue: pendingTrue,
      reviewComplete_valueFalse: pendingFalse,
      otherValue: other,
      productsWithNoReviewRow: out.counts.products - attrs.length,
    };
  } else {
    out.productReview = { note: 'PRODUCT_REVIEW_PENDING config not found' };
  }

  console.log(j(out));
  await p.$disconnect();
}

main().catch(async (e) => { console.error(e); await p.$disconnect(); process.exit(1); });
