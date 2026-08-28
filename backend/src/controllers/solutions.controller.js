const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const { serializeSolutionSummary, serializeSolutionDetail } = require("../services/serialize");

/**
 * Same shape as products.controller.js's LIST_INCLUDE — duplicated rather
 * than imported (that file doesn't export it) because each controller
 * already owns its own admin/public include shape by convention
 * (productAdmin.js's ADMIN_LIST_INCLUDE vs. products.controller.js's
 * LIST_INCLUDE are likewise two separate consts). Needed here so
 * serializeProductSummary (called via serializeSolutionDetail) has
 * everything it reads: category, priceTiers, colors, assets, placementZones.
 */
const PRODUCT_INCLUDE = {
  primaryCategory: { select: { id: true, slug: true, name: true, active: true } },
  categories: {
    include: { category: { select: { id: true, slug: true, name: true, active: true } } },
    orderBy: { sortOrder: "asc" },
  },
  priceTiers: { orderBy: { minQty: "asc" } },
  colors: { where: { active: true }, include: { color: true }, orderBy: { sortOrder: "asc" } },
  assets: {
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { type: true, url: true, alt: true, sortOrder: true },
  },
  placementZones: {
    where: { active: true, view: "FRONT" },
    select: { view: true },
    take: 1,
  },
};

const SOLUTION_PRODUCTS_INCLUDE = {
  products: {
    orderBy: { sortOrder: "asc" },
    include: { product: { include: PRODUCT_INCLUDE } },
  },
};

// GET /api/v1/solutions — active only, ordered by sortOrder. `?featured=true`
// additionally filters to featuredOnHome (Solutions Phase A §6 — homepage
// featured filtering via a clean query option, not a second endpoint).
exports.getSolutions = asyncHandler(async (req, res) => {
  const where = { active: true };
  const isFeaturedQuery = req.validated.query.featured !== undefined;
  if (isFeaturedQuery) where.featuredOnHome = req.validated.query.featured;

  // `?featured=true` orders by homeSortOrder (the homepage's OWN curated
  // order — independently verified against the source data to differ from
  // the hub's `sortOrder`, e.g. "startups" ranks 2nd in the hub but 5th on
  // the homepage). Every other request orders by the hub's `sortOrder`.
  const orderBy = isFeaturedQuery && where.featuredOnHome ? { homeSortOrder: "asc" } : { sortOrder: "asc" };

  const solutions = await prisma.solution.findMany({ where, orderBy, include: SOLUTION_PRODUCTS_INCLUDE });

  sendSuccess(res, { solutions: solutions.map(serializeSolutionSummary) });
});

// GET /api/v1/solutions/:slug — 404 when missing OR inactive (never reveals
// whether a slug exists in draft, same "not found, not forbidden" posture
// as products.controller.js's getProductBySlug).
exports.getSolutionBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.validated.params;
  const solution = await prisma.solution.findFirst({
    where: { slug, active: true },
    include: SOLUTION_PRODUCTS_INCLUDE,
  });
  if (!solution) throw ApiError.notFound("Solution not found");

  sendSuccess(res, { solution: serializeSolutionDetail(solution) });
});
