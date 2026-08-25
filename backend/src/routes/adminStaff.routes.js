const router = require("express").Router();
const { listStaff } = require("../controllers/adminStaff.controller");

router.get("/", listStaff);

module.exports = router;
