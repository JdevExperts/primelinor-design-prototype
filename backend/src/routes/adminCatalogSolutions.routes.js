const router = require("express").Router();
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/requireStaffAuth");
const uploadProductImage = require("../middleware/uploadProductImage");
const controller = require("../controllers/adminCatalogSolutions.controller");
const {
  idParamSchema,
  createSolutionSchema,
  updateSolutionSchema,
  solutionImageMetaSchema,
  solutionProductParamSchema,
  addSolutionProductSchema,
  updateSolutionProductSchema,
} = require("../validation/adminCatalog.schema");

// Reads: any authenticated staff (ADMIN or SALES), same policy as every
// other catalogue admin route.
router.get("/", controller.list);
router.get("/:id", validate(idParamSchema, "params"), controller.get);

// Writes: ADMIN only.
router.post("/", requireRole("ADMIN"), validate(createSolutionSchema, "body"), controller.create);
router.patch(
  "/:id",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateSolutionSchema, "body"),
  controller.update,
);

// Image (subresource, ADMIN only — same shape as category image).
router.post(
  "/:id/image",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  uploadProductImage,
  validate(solutionImageMetaSchema, "body"),
  controller.uploadImage,
);
router.delete("/:id/image", requireRole("ADMIN"), validate(idParamSchema, "params"), controller.removeImage);

// Product mapping (subresource, ADMIN only).
router.post(
  "/:id/products",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(addSolutionProductSchema, "body"),
  controller.addProduct,
);
router.patch(
  "/:id/products/:productId",
  requireRole("ADMIN"),
  validate(solutionProductParamSchema, "params"),
  validate(updateSolutionProductSchema, "body"),
  controller.updateProduct,
);
router.delete(
  "/:id/products/:productId",
  requireRole("ADMIN"),
  validate(solutionProductParamSchema, "params"),
  controller.removeProduct,
);

module.exports = router;
