const router = require("express").Router();
const { getPublicConfig } = require("../controllers/publicConfig.controller");

router.get("/", getPublicConfig);

module.exports = router;
