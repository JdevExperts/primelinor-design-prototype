/**
 * Dynamic sitemap.xml generation (Phase 6B §35) — built from the live
 * active catalogue rather than a static file, so a newly-activated product
 * or Solution is discoverable on the next crawl without a deploy. Uses
 * PUBLIC_APP_URL (services/publicUrls.js) for every URL, the same
 * canonical customer-facing origin real quote links already use — never a
 * hardcoded domain.
 *
 * Deliberately excludes: /admin/*, /customize/:id (workflow, not a
 * landing page — noindex'd on the frontend), /quote/:token (customer-
 * private, noindex'd + no-referrer on the frontend), and any inactive
 * product/solution.
 */
const prisma = require("../lib/prisma");

const PUBLIC_APP_URL = (process.env.PUBLIC_APP_URL || "http://localhost:5187").replace(/\/+$/, "");

const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/products", changefreq: "daily", priority: "0.9" },
  { path: "/solutions", changefreq: "weekly", priority: "0.8" },
  { path: "/corporate-gifting", changefreq: "weekly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.4" },
  { path: "/contact", changefreq: "monthly", priority: "0.4" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/shipping-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/return-replacement-policy", changefreq: "yearly", priority: "0.3" },
];

function escapeXml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(path, { changefreq, priority, lastmod } = {}) {
  const loc = `${PUBLIC_APP_URL}${path}`;
  const parts = [`  <url>`, `    <loc>${escapeXml(loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) parts.push(`    <priority>${priority}</priority>`);
  parts.push(`  </url>`);
  return parts.join("\n");
}

async function buildSitemapXml() {
  const [products, solutions] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.solution.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const entries = [
    ...STATIC_ROUTES.map((r) => urlEntry(r.path, r)),
    ...products.map((p) =>
      urlEntry(`/products/${p.slug}`, { changefreq: "weekly", priority: "0.7", lastmod: p.updatedAt }),
    ),
    ...solutions.map((s) =>
      urlEntry(`/solutions/${s.slug}`, { changefreq: "monthly", priority: "0.6", lastmod: s.updatedAt }),
    ),
  ];

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${entries.join("\n")}\n` +
    `</urlset>\n`
  );
}

module.exports = { buildSitemapXml, PUBLIC_APP_URL };
