const router = require("express").Router();
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/requireStaffAuth");
const uploadProductImage = require("../middleware/uploadProductImage");
const controller = require("../controllers/adminCatalogCategories.controller");
const {
  categorySchema,
  updateCategorySchema,
  categoryImageMetaSchema,
  idParamSchema,
} = require("../validation/adminCatalog.schema");

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

// Image (subresource — same file-upload/ownership handling as product
// assets, ADMIN only, enforced here server-side regardless of what the
// admin UI shows/hides).
router.post(
  "/:id/image",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  uploadProductImage,
  validate(categoryImageMetaSchema, "body"),
  controller.uploadImage,
);
router.delete("/:id/image", requireRole("ADMIN"), validate(idParamSchema, "params"), controller.removeImage);

module.exports = router;
