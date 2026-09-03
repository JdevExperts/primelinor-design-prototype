/**
 * Aggregates every protected /api/v1/admin/* sub-router. Mounted in
 * server.js behind requireStaffAuth + requireTrustedOrigin — nothing here
 * re-declares auth, so a route can never accidentally ship unprotected.
 */
const router = require("express").Router();

router.use("/dashboard", require("./adminDashboard.routes"));
router.use("/leads", require("./adminLeads.routes"));
router.use("/rfqs", require("./adminRfqs.routes"));
router.use("/quotations", require("./adminQuotations.routes"));
router.use("/staff", require("./adminStaff.routes"));
router.use("/catalog", require("./adminCatalog.routes"));

module.exports = router;
