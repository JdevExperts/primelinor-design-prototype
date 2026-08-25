const router = require("express").Router();
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/requireStaffAuth");
const controller = require("../controllers/adminCatalogColors.controller");
const { colorSchema, updateColorSchema, idParamSchema } = require("../validation/adminCatalog.schema");

router.get("/", controller.list);
router.post("/", requireRole("ADMIN"), validate(colorSchema, "body"), controller.create);
router.patch(
  "/:id",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateColorSchema, "body"),
  controller.update,
);

module.exports = router;
