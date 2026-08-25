const router = require("express").Router();
const validate = require("../middleware/validate");
const noStore = require("../middleware/noStore");
const { getQuote, accept, decline, requestRevision, getPdf } = require("../controllers/publicQuotes.controller");
const { tokenParamSchema, customerMessageSchema } = require("../validation/publicQuotes.schema");

router.use(noStore);

router.get("/:token", validate(tokenParamSchema, "params"), getQuote);
router.get("/:token/pdf", validate(tokenParamSchema, "params"), getPdf);
router.post("/:token/accept", validate(tokenParamSchema, "params"), accept);
router.post(
  "/:token/decline",
  validate(tokenParamSchema, "params"),
  validate(customerMessageSchema, "body"),
  decline,
);
router.post(
  "/:token/request-revision",
  validate(tokenParamSchema, "params"),
  validate(customerMessageSchema, "body"),
  requestRevision,
);

module.exports = router;
