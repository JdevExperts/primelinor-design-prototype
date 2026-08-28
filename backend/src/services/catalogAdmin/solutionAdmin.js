/**
 * Solution admin CRUD + product mapping (Solutions Phase A). Update
 * strategy mirrors categoryAdmin.js/productAdmin.js: ONE PATCH endpoint
 * accepting a fully partial payload (each editor tab saves only the
 * section it owns); product mapping is a separate subresource, same
 * reasoning as ProductAsset/PlacementZone being split out of the main
 * product payload.
 *
 * Active invariant (Solutions Phase A §5 / audit §10/§23): an ACTIVE
 * Solution must have >=1 ACTIVE mapped Product. Enforced here, in the
 * service layer, at every mutation that could violate it — never at the DB
 * level, same as categoryAdmin.js's "activating an empty leaf category" and
 * productAdmin.js's tier/MOQ coverage check. Frontend warnings are
 * supplemental; this is authoritative.
 */
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");

const SOLUTION_LIST_INCLUDE = {
  products: { select: { productId: true, product: { select: { active: true } } } },
};

const SOLUTION_DETAIL_INCLUDE = {
  products: {
    orderBy: { sortOrder: "asc" },
    include: { product: { select: { id: true, slug: true, name: true, active: true, primaryCategoryId: true } } },
  },
};

/** Pure — exported for unit testing without a database (see productAdmin.js's assertTierCoversMoq precedent). */
function countActiveMappedProducts(solutionProducts) {
  return (solutionProducts || []).filter((sp) => sp.product?.active).length;
}

/** Pure — the ONE place the active invariant is checked. */
function assertActivationValid(active, activeProductCount) {
  if (active && activeProductCount === 0) {
    throw ApiError.badRequest(
      "Cannot activate a Solution with zero active mapped Products — map at least one active Product first, or keep it inactive/draft.",
    );
  }
}

async function assertUniqueSlug(slug, excludeId) {
  const existing = await prisma.solution.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw ApiError.conflict(`A solution with slug "${slug}" already exists.`);
  }
}

async function listSolutionsAdmin() {
  const solutions = await prisma.solution.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: SOLUTION_LIST_INCLUDE,
  });
  return solutions.map((s) => ({ ...s, activeProductCount: countActiveMappedProducts(s.products) }));
}

async function getSolutionAdmin(id) {
  const solution = await prisma.solution.findUnique({ where: { id }, include: SOLUTION_DETAIL_INCLUDE });
  if (!solution) throw ApiError.notFound("Solution not found.");
  return solution;
}

async function createSolution(data) {
  await assertUniqueSlug(data.slug);
  // A brand-new Solution has no product mappings yet — same "creation
  // before content exists" allowance as Category (§22), except Solution's
  // own rule is stricter: an active BRAND NEW solution is always empty, so
  // requesting active:true at creation is rejected outright (there is no
  // legitimate "create active, map products later" flow for Solutions the
  // way there is for a Category that's really a parent shell).
  assertActivationValid(data.active ?? false, 0);

  return prisma.solution.create({ data: { ...data, active: data.active ?? false } });
}

async function updateSolution(id, data) {
  const existing = await prisma.solution.findUnique({ where: { id }, include: SOLUTION_LIST_INCLUDE });
  if (!existing) throw ApiError.notFound("Solution not found.");

  if (data.slug !== undefined && data.slug !== existing.slug) {
    await assertUniqueSlug(data.slug, id);
  }

  const nextActive = data.active !== undefined ? data.active : existing.active;
  if (nextActive) {
    const activeProductCount = countActiveMappedProducts(existing.products);
    assertActivationValid(true, activeProductCount);
  }

  return prisma.solution.update({ where: { id }, data });
}

// ── Product mapping ──────────────────────────────────────────────────────────

async function assertProductExists(productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.badRequest("Product does not exist.");
  return product;
}

async function addSolutionProduct(solutionId, data) {
  const solution = await prisma.solution.findUnique({ where: { id: solutionId } });
  if (!solution) throw ApiError.notFound("Solution not found.");
  await assertProductExists(data.productId);

  const existing = await prisma.solutionProduct.findUnique({
    where: { solutionId_productId: { solutionId, productId: data.productId } },
  });
  if (existing) throw ApiError.conflict("This product is already mapped to this solution.");

  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const max = await prisma.solutionProduct.aggregate({ where: { solutionId }, _max: { sortOrder: true } });
    sortOrder = (max._max.sortOrder ?? -1) + 1;
  }

  return prisma.solutionProduct.create({
    data: { solutionId, productId: data.productId, sortOrder, featured: data.featured ?? false },
  });
}

/**
 * Applies to both editing a mapping (sortOrder/featured) and — via the
 * shared active-invariant check below — implicitly protects against
 * leaving an active Solution empty, since this function never changes
 * which products are mapped, only their order/featured flag.
 */
async function updateSolutionProduct(solutionId, productId, data) {
  const mapping = await prisma.solutionProduct.findUnique({
    where: { solutionId_productId: { solutionId, productId } },
  });
  if (!mapping) throw ApiError.notFound("This product is not mapped to this solution.");

  return prisma.solutionProduct.update({
    where: { solutionId_productId: { solutionId, productId } },
    data: {
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.featured !== undefined && { featured: data.featured }),
    },
  });
}

/** Rejects removing the last ACTIVE mapped product of an ACTIVE solution (Solutions Phase A §5). */
async function removeSolutionProduct(solutionId, productId) {
  const solution = await prisma.solution.findUnique({ where: { id: solutionId }, include: SOLUTION_LIST_INCLUDE });
  if (!solution) throw ApiError.notFound("Solution not found.");

  const mapping = await prisma.solutionProduct.findUnique({
    where: { solutionId_productId: { solutionId, productId } },
  });
  if (!mapping) throw ApiError.notFound("This product is not mapped to this solution.");

  if (solution.active) {
    const removingActiveProduct = solution.products.find((p) => p.productId === productId)?.product?.active;
    const remainingActiveCount = countActiveMappedProducts(solution.products) - (removingActiveProduct ? 1 : 0);
    assertActivationValid(true, remainingActiveCount);
  }

  return prisma.solutionProduct.delete({ where: { solutionId_productId: { solutionId, productId } } });
}

/**
 * Cross-service guard called from productAdmin.js when a Product's `active`
 * flips to false (Solutions Phase A §5: "deactivating a Product that is the
 * final active mapped product of an active Solution"). Rejects the product
 * deactivation itself rather than silently breaking the Solution invariant.
 */
async function assertProductDeactivationSafe(productId) {
  const affected = await prisma.solution.findMany({
    where: { active: true, products: { some: { productId } } },
    include: SOLUTION_LIST_INCLUDE,
  });
  for (const solution of affected) {
    const activeCount = countActiveMappedProducts(solution.products);
    // This product is currently counted as active in `activeCount` (it's
    // still active in the DB at this point in the request) — deactivating
    // it is only safe if at least one OTHER active product remains.
    if (activeCount <= 1) {
      throw ApiError.badRequest(
        `Cannot deactivate this product — it is the last active product mapped to the active Solution "${solution.name}". Map another active product to that Solution first, or deactivate the Solution.`,
      );
    }
  }
}

module.exports = {
  listSolutionsAdmin,
  getSolutionAdmin,
  createSolution,
  updateSolution,
  addSolutionProduct,
  updateSolutionProduct,
  removeSolutionProduct,
  assertProductDeactivationSafe,
  countActiveMappedProducts,
  assertActivationValid,
};
