const router = require("express").Router();
const validate = require("../middleware/validate");
const ctrl = require("../controllers/adminRfqs.controller");
const { listRfqs, getRfq, updateRfq, addNote, addItem } = ctrl;
const {
  listRfqsQuerySchema,
  idParamSchema,
  updateRfqSchema,
  addNoteSchema,
  rfqItemSchema,
  addWorkingItemSchema,
  updateWorkingItemSchema,
  reorderWorkingItemsSchema,
  workingItemParamSchema,
} = require("../validation/adminRfqs.schema");
const quotations = require("../controllers/adminQuotations.controller");
const { createQuotationSchema, rfqIdParamSchema } = require("../validation/quotations.schema");

router.get("/", validate(listRfqsQuerySchema, "query"), listRfqs);
router.get("/:id", validate(idParamSchema, "params"), getRfq);
router.patch("/:id", validate(idParamSchema, "params"), validate(updateRfqSchema, "body"), updateRfq);
router.post("/:id/notes", validate(idParamSchema, "params"), validate(addNoteSchema, "body"), addNote);
router.post("/:id/items", validate(idParamSchema, "params"), validate(rfqItemSchema, "body"), addItem);

// Working requirement (Phase C) — editable by ADMIN or SALES.
router.post("/:id/working-items", validate(idParamSchema, "params"), validate(addWorkingItemSchema, "body"), ctrl.addWorkingItem);
router.patch(
  "/:id/working-items/:itemId",
  validate(workingItemParamSchema, "params"),
  validate(updateWorkingItemSchema, "body"),
  ctrl.updateWorkingItem,
);
router.delete("/:id/working-items/:itemId", validate(workingItemParamSchema, "params"), ctrl.removeWorkingItem);
router.post(
  "/:id/working-items/reorder",
  validate(idParamSchema, "params"),
  validate(reorderWorkingItemsSchema, "body"),
  ctrl.reorderWorkingItems,
);

router.get("/:rfqId/quotations", validate(rfqIdParamSchema, "params"), quotations.listForRfq);
router.post(
  "/:rfqId/quotations",
  validate(rfqIdParamSchema, "params"),
  validate(createQuotationSchema, "body"),
  quotations.create,
);

module.exports = router;
