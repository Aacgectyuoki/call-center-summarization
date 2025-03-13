const express = require("express");
const {
    analyzeSentiment,
    getProcessingTimes,
    processAnalytics
} = require("../controllers/analyticsController");

const router = express.Router();

// Analyze sentiment of a transcription
router.get("/sentiment/:transcriptionId", analyzeSentiment);

// Fetch processing times for all transcriptions
router.get("/processing-times", getProcessingTimes);

// Fetch analytics for a specific transcription
router.get("/:transcriptionId", processAnalytics);

module.exports = router;
