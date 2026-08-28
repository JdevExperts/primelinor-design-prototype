const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");

async function assertUniqueSlug(slug, excludeId) {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw ApiError.conflict(`A category with slug "${slug}" already exists.`);
  }
}

async function assertValidParent(categoryId, parentCategoryId) {
  if (!parentCategoryId) return;
  if (parentCategoryId === categoryId) {
    throw ApiError.badRequest("A category cannot be its own parent.");
  }
  const parent = await prisma.category.findUnique({ where: { id: parentCategoryId } });
  if (!parent) throw ApiError.badRequest("Parent category does not exist.");

  // Walk up from the proposed parent — if we ever reach `categoryId`
  // itself, assigning this parent would create a cycle (Phase 5 §13).
  let current = parent.parentCategoryId;
  const seen = new Set();
  while (current) {
    if (current === categoryId) {
      throw ApiError.badRequest("This would create a circular category hierarchy.");
    }
    if (seen.has(current)) break;
    seen.add(current);
    const row = await prisma.category.findUnique({ where: { id: current }, select: { parentCategoryId: true } });
    current = row?.parentCategoryId ?? null;
  }
}

async function listCategoriesAdmin() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      children: { select: { id: true } },
      // ALL ProductCategory memberships, not just primary-category products
      // (Solutions Phase 0 §F) — a category a product lists as a secondary
      // membership counts toward that category being "not empty" too.
      productMemberships: { select: { product: { select: { active: true } } } },
    },
  });
  // Still direct memberships only (Solutions/Catalogue Completeness Audit
  // §13) — a parent category's "count" is deliberately 0 direct here even
  // though its children may be full; the admin list surfaces leaf/parent
  // state separately so that reads correctly as healthy, not empty.
  return categories.map((c) => ({
    ...c,
    isLeaf: c.children.length === 0,
    activeProductCount: c.productMemberships.filter((m) => m.product.active).length,
  }));
}

/**
 * Pure — exported for unit testing without a database (see productAdmin.js's
 * assertTierCoversMoq / solutionAdmin.js's assertActivationValid precedent).
 * A parent (has children) is exempt — parents may always be empty of
 * DIRECT products.
 */
function assertLeafActivationValid(isLeaf, activeProductCount) {
  if (isLeaf && activeProductCount === 0) {
    throw ApiError.badRequest(
      "Cannot activate an empty leaf category — add at least one active product first, or keep it inactive.",
    );
  }
}

/**
 * "Activating an empty leaf category is rejected" (Solutions Phase A §22) —
 * checked only on an explicit `active: true` in the request body (the
 * activation action itself), never at creation, since a brand-new category
 * legitimately has 0 products yet and existing flows create the category
 * before its first product (practical semantics per §22, not a DB
 * constraint).
 */
async function assertCanActivateLeaf(categoryId) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      children: { select: { id: true } },
      productMemberships: { select: { product: { select: { active: true } } } },
    },
  });
  if (!category) return;
  const isLeaf = category.children.length === 0;
  const activeProductCount = category.productMemberships.filter((m) => m.product.active).length;
  assertLeafActivationValid(isLeaf, activeProductCount);
}

async function createCategory(data) {
  await assertUniqueSlug(data.slug);
  if (data.parentCategoryId) {
    const parent = await prisma.category.findUnique({ where: { id: data.parentCategoryId } });
    if (!parent) throw ApiError.badRequest("Parent category does not exist.");
  }
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      parentCategoryId: data.parentCategoryId ?? null,
      active: data.active ?? true,
      sortOrder: data.sortOrder ?? 0,
      imageAlt: data.imageAlt ?? null,
    },
  });
}

async function updateCategory(id, data) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Category not found.");

  if (data.slug !== undefined && data.slug !== existing.slug) {
    await assertUniqueSlug(data.slug, id);
  }
  if (data.parentCategoryId !== undefined) {
    await assertValidParent(id, data.parentCategoryId);
  }
  if (data.active === true && !existing.active) {
    await assertCanActivateLeaf(id);
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.parentCategoryId !== undefined && { parentCategoryId: data.parentCategoryId }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.imageAlt !== undefined && { imageAlt: data.imageAlt }),
    },
  });
}

module.exports = { listCategoriesAdmin, createCategory, updateCategory, assertCanActivateLeaf, assertLeafActivationValid };
