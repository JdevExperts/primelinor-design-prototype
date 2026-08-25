const router = require("express").Router();
const uploadArtwork = require("../middleware/uploadArtwork");
const { uploadArtwork: uploadArtworkController } = require("../controllers/uploads.controller");

router.post("/artwork", uploadArtwork, uploadArtworkController);

module.exports = router;
