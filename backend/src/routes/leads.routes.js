const router = require("express").Router();
const validate = require("../middleware/validate");
const { createLead } = require("../controllers/leads.controller");
const { createLeadSchema } = require("../validation/leads.schema");

router.post("/", validate(createLeadSchema, "body"), createLead);

module.exports = router;
