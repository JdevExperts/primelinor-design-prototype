const router = require("express").Router();
const validate = require("../middleware/validate");
const { listLeads, getLead, updateLead, convertLead } = require("../controllers/adminLeads.controller");
const { listLeadsQuerySchema, idParamSchema, updateLeadSchema, convertLeadSchema } = require("../validation/adminLeads.schema");

router.get("/", validate(listLeadsQuerySchema, "query"), listLeads);
router.get("/:id", validate(idParamSchema, "params"), getLead);
router.patch("/:id", validate(idParamSchema, "params"), validate(updateLeadSchema, "body"), updateLead);
router.post("/:id/convert", validate(idParamSchema, "params"), validate(convertLeadSchema, "body"), convertLead);

module.exports = router;
