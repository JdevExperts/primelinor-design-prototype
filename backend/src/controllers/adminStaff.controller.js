const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");

/**
 * Minimal staff directory — not user management (no create/deactivate
 * endpoints; that stays a seed/CLI concern per Phase 3 §41). Exists only so
 * the RFQ assignment UI can list who to assign to.
 */
// GET /api/v1/admin/staff
exports.listStaff = asyncHandler(async (req, res) => {
  const staff = await prisma.staffUser.findMany({
    where: { active: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
  sendSuccess(res, { staff });
});
