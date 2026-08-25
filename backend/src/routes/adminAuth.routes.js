const rateLimit = require("express-rate-limit");
const router = require("express").Router();
const validate = require("../middleware/validate");
const { requireStaffAuth } = require("../middleware/requireStaffAuth");
const { login, logout, me, changePassword } = require("../controllers/adminAuth.controller");
const { loginSchema, changePasswordSchema } = require("../validation/adminAuth.schema");

// Tight, dedicated limit on login attempts (Phase 3 §44) — separate from
// the general API and admin-write limiters, since credential-guessing is
// the specific risk here.
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8 });

router.post("/login", loginLimiter, validate(loginSchema, "body"), login);
router.post("/logout", logout);
router.get("/me", requireStaffAuth, me);
router.post("/change-password", requireStaffAuth, validate(changePasswordSchema, "body"), changePassword);

module.exports = router;
