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
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
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

  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.parentCategoryId !== undefined && { parentCategoryId: data.parentCategoryId }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });
}

module.exports = { listCategoriesAdmin, createCategory, updateCategory };
