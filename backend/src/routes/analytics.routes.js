const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const validate = require("../middleware/validate");
const { collect } = require("../controllers/analytics.controller");
const { analyticsIngestSchema } = require("../validation/analytics.schema");

// A real visitor fires a handful of events per page and maybe a few dozen
// per session; this ceiling stops a single client/bot from flooding the
// table while never getting near a legitimate browsing burst (§14/§16).
const ingestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/collect", ingestLimiter, validate(analyticsIngestSchema, "body"), collect);

module.exports = router;
