const express = require("express");
const { transcribeAudio } = require("../controllers/transcriptionController");
const { processAudioLambda } = require("../controllers/awsLambdaController");
const { generateSummary } = require("../controllers/summaryController");

const router = express.Router();

// AWS Transcribe - Start Transcription
router.post("/transcribe", transcribeAudio);

// Summarization API (GPT-4)
router.post("/summarize", generateSummary);

// AWS Lambda for Audio Processing
router.post("/lambda/process-audio", processAudioLambda);

module.exports = router;
