const express = require("express");
const router = express.Router();
const multer = require("multer");
const { extractAudioFromVideo } = require("../controllers/videoController");

// Configure file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/videos/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

// Route to extract audio from video
router.post("/extract-audio", upload.single("video"), extractAudioFromVideo);

module.exports = router;
