const router = require("express").Router();
const { getArtworkPreview } = require("../controllers/artworkPreview.controller");

router.get("/:key", getArtworkPreview);

module.exports = router;
