const router = require("express").Router();
const validate = require("../middleware/validate");
const noStore = require("../middleware/noStore");
const quotations = require("../controllers/adminQuotations.controller");
const {
  updateQuotationSchema,
  rejectQuotationSchema,
  idParamSchema,
} = require("../validation/quotations.schema");

router.get("/:id", validate(idParamSchema, "params"), quotations.get);
router.patch("/:id", validate(idParamSchema, "params"), validate(updateQuotationSchema, "body"), quotations.update);
router.post("/:id/send", validate(idParamSchema, "params"), quotations.send);
router.post("/:id/accept", validate(idParamSchema, "params"), quotations.accept);
router.post(
  "/:id/reject",
  validate(idParamSchema, "params"),
  validate(rejectQuotationSchema, "body"),
  quotations.reject,
);
router.post("/:id/link/regenerate", validate(idParamSchema, "params"), quotations.regenerateLink);
router.post("/:id/link/revoke", validate(idParamSchema, "params"), quotations.revokeLink);
router.get("/:id/pdf", noStore, validate(idParamSchema, "params"), quotations.getPdf);

module.exports = router;
