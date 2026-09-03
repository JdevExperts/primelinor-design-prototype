const router = require("express").Router();
const validate = require("../middleware/validate");
const noStore = require("../middleware/noStore");
const quotations = require("../controllers/adminQuotations.controller");
const {
  updateQuotationSchema,
  rejectQuotationSchema,
  createManualQuotationSchema,
  createRevisionSchema,
  cancelQuotationSchema,
  quotationNoteSchema,
  listQuotationsQuerySchema,
  idParamSchema,
  quotationNoteParamSchema,
} = require("../validation/quotations.schema");

router.get("/", validate(listQuotationsQuerySchema, "query"), quotations.list);
router.post("/manual", validate(createManualQuotationSchema, "body"), quotations.createManual);
router.get("/:id", validate(idParamSchema, "params"), quotations.get);
router.patch("/:id", validate(idParamSchema, "params"), validate(updateQuotationSchema, "body"), quotations.update);
router.post(
  "/:id/revise",
  validate(idParamSchema, "params"),
  validate(createRevisionSchema, "body"),
  quotations.revise,
);
router.post(
  "/:id/cancel",
  validate(idParamSchema, "params"),
  validate(cancelQuotationSchema, "body"),
  quotations.cancel,
);
router.post("/:id/import-rfq-items", validate(idParamSchema, "params"), quotations.importRfqItems);
router.post("/:id/send", validate(idParamSchema, "params"), quotations.send);
router.post("/:id/accept", validate(idParamSchema, "params"), quotations.accept);
router.post(
  "/:id/reject",
  validate(idParamSchema, "params"),
  validate(rejectQuotationSchema, "body"),
  quotations.reject,
);
router.get("/:id/notes", validate(idParamSchema, "params"), quotations.listNotes);
router.post(
  "/:id/notes",
  validate(idParamSchema, "params"),
  validate(quotationNoteSchema, "body"),
  quotations.addNote,
);
router.patch(
  "/:id/notes/:noteId",
  validate(quotationNoteParamSchema, "params"),
  validate(quotationNoteSchema, "body"),
  quotations.updateNote,
);
router.post("/:id/link/regenerate", validate(idParamSchema, "params"), quotations.regenerateLink);
router.post("/:id/link/revoke", validate(idParamSchema, "params"), quotations.revokeLink);
router.get("/:id/pdf", noStore, validate(idParamSchema, "params"), quotations.getPdf);

module.exports = router;
