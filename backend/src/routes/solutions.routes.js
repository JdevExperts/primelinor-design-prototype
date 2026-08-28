const router = require("express").Router();
const validate = require("../middleware/validate");
const { getSolutions, getSolutionBySlug } = require("../controllers/solutions.controller");
const { listSolutionsQuerySchema, slugParamSchema } = require("../validation/solutions.schema");

router.get("/", validate(listSolutionsQuerySchema, "query"), getSolutions);
router.get("/:slug", validate(slugParamSchema, "params"), getSolutionBySlug);

module.exports = router;
