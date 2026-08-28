const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const { effectivePrice, compareByEffectivePrice } = require("../services/pricing");
const { serializeProductSummary, serializeProductDetail } = require("../services/serialize");

const LIST_INCLUDE = {
  primaryCategory: { select: { id: true, slug: true, name: true, active: true } },
  categories: {
    include: { category: { select: { id: true, slug: true, name: true, active: true } } },
    orderBy: { sortOrder: "asc" },
  },
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
  // Matches ANY category membership, not only the primary (Solutions Phase
  // 0 §H) — a dry-fit tee whose primary is T-Shirts but is also mapped to
  // Sports Teams & Clubs shows up when filtering by either category.
  if (query.category) where.categories = { some: { category: { slug: query.category } } };
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

/**
 * This product's ProductCategory.sortOrder for ONE specific category (its
 * merchandising rank within that category's listing), or null if the
 * product isn't found to have been included in `categories` (shouldn't
 * happen when called from a category-filtered query, but never trusted).
 * Pure — exported for unit testing without a database.
 */
function categoryMembershipSortOrder(product, categorySlug) {
  if (!categorySlug) return null;
  const membership = (product.categories || []).find((pc) => pc.category?.slug === categorySlug);
  return membership ? membership.sortOrder : null;
}

/**
 * `categorySlug` — the active `?category=` filter, if any. Only the
 * "recommended" (default) sort is merchandising-controlled per category;
 * an explicit sort choice (price/moq/newest) stays a literal, category-
 * independent ordering regardless of which category filter is active
 * (Solutions/Catalogue Merchandising Audit §5/§6) — this never touches PDP
 * or primaryCategory semantics, only the LIST endpoint's default order.
 */
function sortProducts(products, sortKey, categorySlug) {
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
      if (categorySlug) {
        return list.sort((a, b) => {
          const ca = categoryMembershipSortOrder(a, categorySlug) ?? Infinity;
          const cb = categoryMembershipSortOrder(b, categorySlug) ?? Infinity;
          return ca - cb || a.sortOrder - b.sortOrder || byName(a, b);
        });
      }
      return list.sort((a, b) => a.sortOrder - b.sortOrder || byName(a, b));
  }
}

// GET /api/v1/products
exports.getProducts = asyncHandler(async (req, res) => {
  const query = req.validated.query;
  const where = buildWhere(query);

  const all = await prisma.product.findMany({ where, include: LIST_INCLUDE });
  const priceFiltered = applyPriceRange(all, query);
  const sorted = sortProducts(priceFiltered, query.sort, query.category);

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
exports.categoryMembershipSortOrder = categoryMembershipSortOrder;
