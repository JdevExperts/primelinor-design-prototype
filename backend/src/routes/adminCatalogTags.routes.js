const router = require("express").Router();
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/requireStaffAuth");
const controller = require("../controllers/adminCatalogTags.controller");
const { tagSchema } = require("../validation/adminCatalog.schema");

router.get("/", controller.list);
router.post("/", requireRole("ADMIN"), validate(tagSchema, "body"), controller.create);

module.exports = router;
