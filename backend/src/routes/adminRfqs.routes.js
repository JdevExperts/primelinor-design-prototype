const router = require("express").Router();
const validate = require("../middleware/validate");
const { listRfqs, getRfq, updateRfq, addNote, addItem } = require("../controllers/adminRfqs.controller");
const {
  listRfqsQuerySchema,
  idParamSchema,
  updateRfqSchema,
  addNoteSchema,
  rfqItemSchema,
} = require("../validation/adminRfqs.schema");
const quotations = require("../controllers/adminQuotations.controller");
const { createQuotationSchema, rfqIdParamSchema } = require("../validation/quotations.schema");

router.get("/", validate(listRfqsQuerySchema, "query"), listRfqs);
router.get("/:id", validate(idParamSchema, "params"), getRfq);
router.patch("/:id", validate(idParamSchema, "params"), validate(updateRfqSchema, "body"), updateRfq);
router.post("/:id/notes", validate(idParamSchema, "params"), validate(addNoteSchema, "body"), addNote);
router.post("/:id/items", validate(idParamSchema, "params"), validate(rfqItemSchema, "body"), addItem);

router.get("/:rfqId/quotations", validate(rfqIdParamSchema, "params"), quotations.listForRfq);
router.post(
  "/:rfqId/quotations",
  validate(rfqIdParamSchema, "params"),
  validate(createQuotationSchema, "body"),
  quotations.create,
);

module.exports = router;
