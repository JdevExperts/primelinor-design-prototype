const router = require("express").Router();
const validate = require("../middleware/validate");
const { getProducts, getProductBySlug } = require("../controllers/products.controller");
const { listProductsQuerySchema, slugParamSchema } = require("../validation/products.schema");

router.get("/", validate(listProductsQuerySchema, "query"), getProducts);
router.get("/:slug", validate(slugParamSchema, "params"), getProductBySlug);

module.exports = router;
