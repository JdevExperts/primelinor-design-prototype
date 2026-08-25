/**
 * Password hashing + JWT issuing/verification for staff auth.
 *
 * Token strategy (Phase 3 §5/§42): a short-lived JWT (4h) carried in an
 * HttpOnly, SameSite=Strict cookie — never localStorage, so it's invisible
 * to any XSS in the admin bundle. The signature alone is NOT trusted as
 * proof of a valid session: requireStaffAuth (middleware) re-reads the
 * StaffUser row on every request and rejects if it's gone or `active` is
 * now false. That gives real, immediate revocation (deactivate a user and
 * their live token stops working on their very next request) without
 * needing a token-blocklist table — the practical alternative to full
 * server-side session storage for a small internal tool. Logout simply
 * clears the cookie; the 4h expiry is the outer bound if a token is ever
 * stolen before that.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL_SECONDS = 4 * 60 * 60; // 4h
const COOKIE_NAME = "pl_admin_token";

if (!JWT_SECRET && process.env.NODE_ENV !== "test") {
  throw new Error("JWT_SECRET must be set — see .env.example");
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signStaffToken(staffUser) {
  return jwt.sign({ sub: staffUser.id, role: staffUser.role }, JWT_SECRET, {
    expiresIn: TOKEN_TTL_SECONDS,
  });
}

/** Returns the decoded payload, or null if missing/expired/invalid. */
function verifyStaffToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_TTL_SECONDS * 1000,
    path: "/",
  };
}

module.exports = {
  COOKIE_NAME,
  hashPassword,
  verifyPassword,
  signStaffToken,
  verifyStaffToken,
  cookieOptions,
};
