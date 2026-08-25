const router = require("express").Router();
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/requireStaffAuth");
const controller = require("../controllers/adminCatalogCategories.controller");
const { categorySchema, updateCategorySchema, idParamSchema } = require("../validation/adminCatalog.schema");

// Reads: any authenticated staff (ADMIN or SALES) — Phase 5 §3.
router.get("/", controller.list);

// Writes: ADMIN only.
router.post("/", requireRole("ADMIN"), validate(categorySchema, "body"), controller.create);
router.patch(
  "/:id",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateCategorySchema, "body"),
  controller.update,
);

module.exports = router;
