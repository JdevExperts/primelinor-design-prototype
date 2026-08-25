/**
 * Protects every /api/v1/admin/* route except login. Reads the HttpOnly
 * cookie, verifies the JWT, then re-checks the StaffUser exists and is
 * active — the signature alone is never sufficient (Phase 3 §5). Attaches
 * the fresh row as req.staffUser for controllers/downstream middleware.
 */
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const prisma = require("../lib/prisma");
const { COOKIE_NAME, verifyStaffToken } = require("../services/auth");

const requireStaffAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  const payload = token ? verifyStaffToken(token) : null;
  if (!payload) throw new ApiError(401, "Not signed in.");

  const staffUser = await prisma.staffUser.findUnique({ where: { id: payload.sub } });
  if (!staffUser || !staffUser.active) throw new ApiError(401, "Session is no longer valid.");

  req.staffUser = staffUser;
  next();
});

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.staffUser) return next(new ApiError(401, "Not signed in."));
    if (!roles.includes(req.staffUser.role)) return next(new ApiError(403, "Not permitted."));
    next();
  };
}

module.exports = { requireStaffAuth, requireRole };
