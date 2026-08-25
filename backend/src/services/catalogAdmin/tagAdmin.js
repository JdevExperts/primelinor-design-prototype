const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");

async function listTagsAdmin() {
  return prisma.tag.findMany({ orderBy: { name: "asc" } });
}

async function createTag(data) {
  const existing = await prisma.tag.findUnique({ where: { slug: data.slug } });
  if (existing) throw ApiError.conflict(`A tag with slug "${data.slug}" already exists.`);
  return prisma.tag.create({ data: { name: data.name, slug: data.slug } });
}

module.exports = { listTagsAdmin, createTag };
