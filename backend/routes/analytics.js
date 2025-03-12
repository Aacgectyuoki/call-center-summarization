const express = require("express");
const router = express.Router();
const { analyzeSentiment, getProcessingTimes } = require("../controllers/analyticsController");

// Route to analyze sentiment of a transcription
router.get("/sentiment/:transcriptionId", analyzeSentiment);

// Route to get processing times
router.get("/processing-times", getProcessingTimes);

module.exports = router;
