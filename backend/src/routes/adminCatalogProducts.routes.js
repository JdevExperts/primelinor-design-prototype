const router = require("express").Router();
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/requireStaffAuth");
const uploadProductImage = require("../middleware/uploadProductImage");
const products = require("../controllers/adminCatalogProducts.controller");
const assets = require("../controllers/adminCatalogAssets.controller");
const zones = require("../controllers/adminCatalogPlacementZones.controller");
const {
  idParamSchema,
  productSubIdParamSchema,
  productZoneIdParamSchema,
  adminListProductsQuerySchema,
  createProductSchema,
  updateProductSchema,
  duplicateProductSchema,
  uploadAssetMetaSchema,
  createAssetFromUrlSchema,
  updateAssetSchema,
  placementZoneSchema,
  updatePlacementZoneSchema,
} = require("../validation/adminCatalog.schema");

// Reads: any authenticated staff (ADMIN or SALES) — Phase 5 §3.
router.get("/", validate(adminListProductsQuerySchema, "query"), products.list);
router.get("/:id", validate(idParamSchema, "params"), products.get);

// Writes: ADMIN only.
router.post("/", requireRole("ADMIN"), validate(createProductSchema, "body"), products.create);
router.patch(
  "/:id",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateProductSchema, "body"),
  products.update,
);
router.post(
  "/:id/duplicate",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(duplicateProductSchema, "body"),
  products.duplicate,
);

// Assets (subresource — separate lifecycle from the main product payload
// because of file-upload handling, Phase 5 §44).
router.post(
  "/:id/assets/upload",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  uploadProductImage,
  validate(uploadAssetMetaSchema, "body"),
  assets.upload,
);
router.post(
  "/:id/assets",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(createAssetFromUrlSchema, "body"),
  assets.createFromUrl,
);
router.patch(
  "/:id/assets/:assetId",
  requireRole("ADMIN"),
  validate(productSubIdParamSchema, "params"),
  validate(updateAssetSchema, "body"),
  assets.update,
);
router.delete(
  "/:id/assets/:assetId",
  requireRole("ADMIN"),
  validate(productSubIdParamSchema, "params"),
  assets.remove,
);

// Placement zones (subresource).
router.post(
  "/:id/placement-zones",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(placementZoneSchema, "body"),
  zones.create,
);
router.patch(
  "/:id/placement-zones/:zoneId",
  requireRole("ADMIN"),
  validate(productZoneIdParamSchema, "params"),
  validate(updatePlacementZoneSchema, "body"),
  zones.update,
);
router.delete(
  "/:id/placement-zones/:zoneId",
  requireRole("ADMIN"),
  validate(productZoneIdParamSchema, "params"),
  zones.remove,
);

module.exports = router;
