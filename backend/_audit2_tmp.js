/* PHASE 6C-2 — READ-ONLY catalogue + integrity + S3 audit. No writes. */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const { catalogueHealth } = require('./src/services/catalogueHealth');
const j = (x) => JSON.stringify(x, (k, v) => (typeof v === 'bigint' ? Number(v) : v), 2);

async function main() {
  const out = {};

  // ---- Catalogue health (reuses production predicate module) ----
  out.catalogueHealth = await catalogueHealth();

  // ---- Product totals ----
  out.productTotals = {
    total: await p.product.count(),
    active: await p.product.count({ where: { active: true } }),
    inactive: await p.product.count({ where: { active: false } }),
    quoteOnly: await p.product.count({ where: { priceMode: 'QUOTE_ONLY' } }),
    missingMoq: await p.product.count({ where: { OR: [{ moq: 0 }, { moq: { lte: 0 } }] } }),
  };

  // ---- Product code uniqueness ----
  const codes = await p.product.findMany({ select: { productCode: true } });
  const seen = {};
  for (const c of codes) seen[c.productCode] = (seen[c.productCode] || 0) + 1;
  out.productCodes = {
    total: codes.length,
    unique: Object.keys(seen).length,
    duplicates: Object.entries(seen).filter(([, n]) => n > 1).map(([code, n]) => ({ code, n })),
  };

  // ---- Categories / Solutions ----
  out.categories = {
    total: await p.category.count(),
    active: await p.category.count({ where: { active: true } }),
  };
  out.solutions = {
    total: await p.solution.count(),
    active: await p.solution.count({ where: { active: true } }),
  };
  out.mappings = {
    productCategory: await p.productCategory.count(),
    solutionProduct: await p.solutionProduct.count(),
  };

  // ---- Primary image presence ----
  out.primaryImage = {
    withCatalogImage: await p.product.count({ where: { assets: { some: { type: 'CATALOG', active: true } } } }),
    withoutCatalogImage: await p.product.count({ where: { assets: { none: { type: 'CATALOG', active: true } } } }),
  };

  // ========== ORPHAN / INTEGRITY CHECKS (raw SQL, read-only) ==========
  const q = (sql) => p.$queryRawUnsafe(sql);

  out.orphans = {};
  out.orphans.quotationLines_noQuotation = await q(
    `SELECT COUNT(*)::int AS n FROM quotation_lines ql LEFT JOIN quotations qq ON qq.id = ql.quotation_id WHERE qq.id IS NULL`,
  );
  out.orphans.quotationLines_danglingRfqItem = await q(
    `SELECT COUNT(*)::int AS n FROM quotation_lines ql WHERE ql.rfq_item_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM rfq_items ri WHERE ri.id = ql.rfq_item_id)`,
  );
  out.orphans.rfqItems_noRfq = await q(
    `SELECT COUNT(*)::int AS n FROM rfq_items ri LEFT JOIN rfqs r ON r.id = ri.rfq_id WHERE r.id IS NULL`,
  );
  out.orphans.rfqWorkingItems_noRfq = await q(
    `SELECT COUNT(*)::int AS n FROM rfq_working_items wi LEFT JOIN rfqs r ON r.id = wi.rfq_id WHERE r.id IS NULL`,
  );
  out.orphans.rfqActivity_dangling = await q(
    `SELECT COUNT(*)::int AS n FROM rfq_activity a
       WHERE (a.rfq_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM rfqs r WHERE r.id = a.rfq_id))
          OR (a.quotation_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quotations q2 WHERE q2.id = a.quotation_id))
          OR (a.rfq_id IS NULL AND a.quotation_id IS NULL)`,
  );
  out.orphans.internalNotes_dangling = await q(
    `SELECT COUNT(*)::int AS n FROM internal_notes n
       WHERE (n.rfq_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM rfqs r WHERE r.id = n.rfq_id))
          OR (n.quotation_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quotations q2 WHERE q2.id = n.quotation_id))`,
  );
  out.orphans.artwork_danglingRfqItem = await q(
    `SELECT COUNT(*)::int AS n FROM artwork_assets aa WHERE aa.rfq_item_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM rfq_items ri WHERE ri.id = aa.rfq_item_id)`,
  );
  out.orphans.productCategory_broken = await q(
    `SELECT COUNT(*)::int AS n FROM product_categories pc
       WHERE NOT EXISTS (SELECT 1 FROM products pr WHERE pr.id = pc.product_id)
          OR NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = pc.category_id)`,
  );
  out.orphans.solutionProduct_broken = await q(
    `SELECT COUNT(*)::int AS n FROM solution_products sp
       WHERE NOT EXISTS (SELECT 1 FROM products pr WHERE pr.id = sp.product_id)
          OR NOT EXISTS (SELECT 1 FROM solutions s WHERE s.id = sp.solution_id)`,
  );
  out.orphans.product_primaryCategoryMissingMembership = await q(
    `SELECT COUNT(*)::int AS n FROM products pr
       WHERE NOT EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = pr.id AND pc.category_id = pr.primary_category_id)`,
  );
  out.orphans.productAttributes_danglingConfig = await q(
    `SELECT COUNT(*)::int AS n FROM product_attributes pa WHERE NOT EXISTS (SELECT 1 FROM product_attribute_configs c WHERE c.id = pa.attribute_id)`,
  );
  out.orphans.productAttributes_danglingProduct = await q(
    `SELECT COUNT(*)::int AS n FROM product_attributes pa WHERE NOT EXISTS (SELECT 1 FROM products pr WHERE pr.id = pa.product_id)`,
  );
  out.orphans.productAssets_danglingProduct = await q(
    `SELECT COUNT(*)::int AS n FROM product_assets a WHERE NOT EXISTS (SELECT 1 FROM products pr WHERE pr.id = a.product_id)`,
  );
  out.orphans.quotations_danglingRfq = await q(
    `SELECT COUNT(*)::int AS n FROM quotations q2 WHERE q2.rfq_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM rfqs r WHERE r.id = q2.rfq_id)`,
  );
  out.orphans.leads_danglingContact = await q(
    `SELECT COUNT(*)::int AS n FROM leads l WHERE NOT EXISTS (SELECT 1 FROM contacts c WHERE c.id = l.contact_id)`,
  );
  out.orphans.rfqs_danglingContact = await q(
    `SELECT COUNT(*)::int AS n FROM rfqs r WHERE NOT EXISTS (SELECT 1 FROM contacts c WHERE c.id = r.contact_id)`,
  );

  // ========== S3 / ASSET reference audit ==========
  const assetRows = await p.productAsset.findMany({ select: { id: true, productId: true, type: true, url: true, storageKey: true } });
  const catImg = await p.category.findMany({ select: { id: true, name: true, imageUrl: true, imageStorageKey: true } });
  const solImg = await p.solution.findMany({ select: { id: true, name: true, imageUrl: true, imageStorageKey: true } });

  const bad = (u) => {
    if (u == null) return 'null';
    const s = String(u).trim();
    if (s === '') return 'empty';
    if (/localhost|127\.0\.0\.1/i.test(s)) return 'localhost';
    if (/^file:|^\/Users\/|^\/home\/|^[A-Za-z]:\\\\/.test(s)) return 'local-fs-path';
    if (/^https?:\/\//i.test(s)) return null;
    if (s.startsWith('/')) return 'root-relative';
    return 'other-non-url';
  };
  out.assetAudit = {
    productAssets: {
      total: assetRows.length,
      byUrlHealth: {},
      samples: assetRows.slice(0, 5).map((a) => ({ type: a.type, url: a.url, storageKey: a.storageKey })),
      problems: assetRows.map((a) => ({ ...a, issue: bad(a.url) })).filter((a) => a.issue).slice(0, 50),
    },
    categoryImages: catImg.map((c) => ({ ...c, issue: c.imageUrl == null ? null : bad(c.imageUrl) })).filter((c) => c.issue),
    solutionImages: solImg.map((s) => ({ ...s, issue: s.imageUrl == null ? null : bad(s.imageUrl) })).filter((s) => s.issue),
  };
  for (const a of assetRows) {
    const h = bad(a.url) || 'ok';
    out.assetAudit.productAssets.byUrlHealth[h] = (out.assetAudit.productAssets.byUrlHealth[h] || 0) + 1;
  }
  // Distinct URL host breakdown
  const hosts = {};
  for (const a of assetRows) {
    try { const h = new URL(a.url).host; hosts[h] = (hosts[h] || 0) + 1; } catch { hosts['(unparseable)'] = (hosts['(unparseable)'] || 0) + 1; }
  }
  out.assetAudit.productAssetHosts = hosts;

  console.log(j(out));
  await p.$disconnect();
}
main().catch(async (e) => { console.error(e); await p.$disconnect(); process.exit(1); });
