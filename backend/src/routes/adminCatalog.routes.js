/**
 * Aggregates every /api/v1/admin/catalog/* sub-router (Phase 5). Mounted
 * inside admin.routes.js, so it inherits requireStaffAuth +
 * requireTrustedOrigin from server.js — nothing here re-declares that.
 * Each individual route additionally applies requireRole("ADMIN") on
 * mutations only; reads stay open to any authenticated staff (ADMIN or
 * SALES) per Phase 5 §3.
 */
const router = require("express").Router();

router.use("/products", require("./adminCatalogProducts.routes"));
router.use("/categories", require("./adminCatalogCategories.routes"));
router.use("/colors", require("./adminCatalogColors.routes"));
router.use("/tags", require("./adminCatalogTags.routes"));

module.exports = router;
