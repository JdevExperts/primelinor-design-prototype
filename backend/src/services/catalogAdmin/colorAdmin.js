const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");

async function assertUniqueSlug(slug, excludeId) {
  const existing = await prisma.color.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw ApiError.conflict(`A color with slug "${slug}" already exists.`);
  }
}

async function listColorsAdmin() {
  return prisma.color.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

async function createColor(data) {
  await assertUniqueSlug(data.slug);
  return prisma.color.create({
    data: {
      name: data.name,
      slug: data.slug,
      hex: data.hex ?? null,
      active: data.active ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

async function updateColor(id, data) {
  const existing = await prisma.color.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Color not found.");
  if (data.slug !== undefined && data.slug !== existing.slug) {
    await assertUniqueSlug(data.slug, id);
  }
  return prisma.color.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.hex !== undefined && { hex: data.hex }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });
}

module.exports = { listColorsAdmin, createColor, updateColor };
