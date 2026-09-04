const router = require("express").Router();
const { z } = require("zod");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/adminDashboard.controller");

// ADMIN and SALES may both read every dashboard section (§41). Catalogue
// *mutation* stays ADMIN-only and lives on its own routes — nothing here
// writes.
const periodQuerySchema = z
  .object({ period: z.enum(["today", "7d", "30d", "90d"]).optional() })
  .strip();

router.get("/overview", validate(periodQuerySchema, "query"), ctrl.overview);
router.get("/website", validate(periodQuerySchema, "query"), ctrl.website);
router.get("/sales", validate(periodQuerySchema, "query"), ctrl.sales);
router.get("/products", validate(periodQuerySchema, "query"), ctrl.products);
router.get("/catalogue-health", ctrl.catalogueHealth);

module.exports = router;
