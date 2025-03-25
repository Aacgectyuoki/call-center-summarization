const express = require("express");
const router = express.Router();
const { transcribeYouTube } = require("../controllers/youtubeController");

// Route to transcribe YouTube videos
router.post("/transcribe", transcribeYouTube);

module.exports = router;
