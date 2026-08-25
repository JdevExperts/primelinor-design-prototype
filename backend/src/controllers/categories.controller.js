const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const { serializeCategory } = require("../services/serialize");

// GET /api/v1/categories — active top-level categories, each with one level
// of active children, ordered by sortOrder. Deliberately not over-nested.
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { active: true, parentCategoryId: null },
    orderBy: { sortOrder: "asc" },
    include: { children: true },
  });

  sendSuccess(res, { categories: categories.map(serializeCategory) });
});
