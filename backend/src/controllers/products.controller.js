const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const { effectivePrice, compareByEffectivePrice } = require("../services/pricing");
const { serializeProductSummary, serializeProductDetail } = require("../services/serialize");

const LIST_INCLUDE = {
  category: { select: { id: true, slug: true, name: true } },
  priceTiers: { orderBy: { minQty: "asc" } },
  colors: { where: { active: true }, include: { color: true }, orderBy: { sortOrder: "asc" } },
  // Just enough to compute `primaryImage` server-side (Phase 6A.1 §30/§31)
  // — the summary shape never ships this raw array to the client, only
  // the derived field serializeProductSummary computes from it.
  assets: {
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { type: true, url: true, alt: true, sortOrder: true },
  },
  // Existence-only, for `studioReady` (Phase 6A.1 §20/§36) — the summary
  // shape never ships this, only the derived boolean.
  placementZones: {
    where: { active: true, view: "FRONT" },
    select: { view: true },
    take: 1,
  },
};

const DETAIL_INCLUDE = {
  ...LIST_INCLUDE,
  variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
  specifications: { orderBy: { sortOrder: "asc" } },
  assets: { where: { active: true }, orderBy: { sortOrder: "asc" } },
  placementZones: { where: { active: true }, orderBy: { sortOrder: "asc" } },
  tags: { include: { tag: true } },
  relatedFrom: {
    orderBy: { sortOrder: "asc" },
    include: { relatedProduct: { include: LIST_INCLUDE } },
  },
};

function buildWhere(query) {
  const where = { active: true };
  if (query.category) where.category = { slug: query.category };
  if (query.material) where.material = { equals: query.material, mode: "insensitive" };
  if (query.customizable !== undefined) where.customizable = query.customizable;
  if (query.color) where.colors = { some: { active: true, color: { slug: query.color } } };

  if (query.minGsm !== undefined || query.maxGsm !== undefined) {
    where.gsm = {};
    if (query.minGsm !== undefined) where.gsm.gte = query.minGsm;
    if (query.maxGsm !== undefined) where.gsm.lte = query.maxGsm;
  }
  if (query.minMoq !== undefined || query.maxMoq !== undefined) {
    where.moq = {};
    if (query.minMoq !== undefined) where.moq.gte = query.minMoq;
    if (query.maxMoq !== undefined) where.moq.lte = query.maxMoq;
  }
  return where;
}

/**
 * Sorting/price-range filtering happen in JS, after a where-filtered (but
 * unpaginated) fetch, rather than at the SQL level — effective price spans
 * two shapes (a plain column for FIXED, a MIN across child rows for
 * TIERED) and isn't a single indexable column. This is deliberately simple
 * and correct rather than clever; it's fine at "modest catalogue" size
 * (the target architecture explicitly scopes Phase 1 this way) and should
 * move to a denormalized/indexed price column with real SQL sort/filter
 * once the catalogue is large enough for that to matter.
 */
function applyPriceRange(products, { minPrice, maxPrice }) {
  if (minPrice === undefined && maxPrice === undefined) return products;
  return products.filter((product) => {
    const price = effectivePrice(product);
    if (price == null) return false;
    if (minPrice !== undefined && price < minPrice) return false;
    if (maxPrice !== undefined && price > maxPrice) return false;
    return true;
  });
}

function sortProducts(products, sortKey) {
  const list = [...products];
  const byName = (a, b) => a.name.localeCompare(b.name);

  switch (sortKey) {
    case "price_asc":
      return list.sort((a, b) => compareByEffectivePrice(a, b, "asc") || byName(a, b));
    case "price_desc":
      return list.sort((a, b) => compareByEffectivePrice(a, b, "desc") || byName(a, b));
    case "moq_asc":
      return list.sort((a, b) => a.moq - b.moq || byName(a, b));
    case "newest":
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || byName(a, b));
    case "recommended":
    default:
      return list.sort((a, b) => a.sortOrder - b.sortOrder || byName(a, b));
  }
}

// GET /api/v1/products
exports.getProducts = asyncHandler(async (req, res) => {
  const query = req.validated.query;
  const where = buildWhere(query);

  const all = await prisma.product.findMany({ where, include: LIST_INCLUDE });
  const priceFiltered = applyPriceRange(all, query);
  const sorted = sortProducts(priceFiltered, query.sort);

  const total = sorted.length;
  const start = (query.page - 1) * query.limit;
  const pageItems = sorted.slice(start, start + query.limit);

  sendSuccess(res, {
    products: pageItems.map(serializeProductSummary),
    total,
    page: query.page,
    limit: query.limit,
  });
});

// GET /api/v1/products/:slug
exports.getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.validated.params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: DETAIL_INCLUDE,
  });
  if (!product) throw ApiError.notFound("Product not found");

  sendSuccess(res, { product: serializeProductDetail(product) });
});

// Exported for unit testing without a database — see test/products.filter.test.js
exports.buildWhere = buildWhere;
exports.applyPriceRange = applyPriceRange;
exports.sortProducts = sortProducts;
