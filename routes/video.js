const express = require("express");
const multer = require("multer");
const { extractAudioFromVideo } = require("../controllers/videoController");

const router = express.Router();

// Multer storage configuration for video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/videos/"); // Save uploaded videos in "uploads/videos"
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Route to upload a video and extract audio
router.post("/extract-audio", upload.single("video"), extractAudioFromVideo);

module.exports = router;