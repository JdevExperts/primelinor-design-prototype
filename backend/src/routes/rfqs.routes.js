const router = require("express").Router();
const validate = require("../middleware/validate");
const { createRfq } = require("../controllers/rfqs.controller");
const { createRfqSchema } = require("../validation/rfqs.schema");

router.post("/", validate(createRfqSchema, "body"), createRfq);

module.exports = router;
