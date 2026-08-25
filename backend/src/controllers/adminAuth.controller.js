const prisma = require("../lib/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const sendSuccess = require("../utils/sendSuccess");
const { hashPassword, verifyPassword, signStaffToken, cookieOptions, COOKIE_NAME } = require("../services/auth");
const { serializeStaffUser } = require("../services/serializeStaff");

// A single generic message for both "no such email" and "wrong password" —
// never confirm which one it was, so login can't be used to enumerate
// staff email addresses.
const INVALID_CREDENTIALS = "Invalid email or password.";

// POST /api/v1/admin/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const staffUser = await prisma.staffUser.findUnique({ where: { email } });
  if (!staffUser || !staffUser.active) throw new ApiError(401, INVALID_CREDENTIALS);

  const valid = await verifyPassword(password, staffUser.passwordHash);
  if (!valid) throw new ApiError(401, INVALID_CREDENTIALS);

  const updated = await prisma.staffUser.update({
    where: { id: staffUser.id },
    data: { lastLoginAt: new Date() },
  });

  const token = signStaffToken(updated);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  sendSuccess(res, { staffUser: serializeStaffUser(updated) });
});

// POST /api/v1/admin/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  sendSuccess(res, { loggedOut: true });
});

// GET /api/v1/admin/auth/me
exports.me = asyncHandler(async (req, res) => {
  sendSuccess(res, { staffUser: serializeStaffUser(req.staffUser) });
});

// POST /api/v1/admin/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validated.body;

  const valid = await verifyPassword(currentPassword, req.staffUser.passwordHash);
  if (!valid) throw ApiError.badRequest("Current password is incorrect.");

  const passwordHash = await hashPassword(newPassword);
  await prisma.staffUser.update({ where: { id: req.staffUser.id }, data: { passwordHash } });

  sendSuccess(res, { changed: true });
});
