const express = require("express");
const { transcribeAudio } = require("../controllers/transcriptionController");
const { summarizeText } = require("../controllers/summaryController");
const { processAudioLambda } = require("../controllers/awsLambdaController");

const router = express.Router();

// Transcription API (AWS Transcribe)
router.post("/transcribe", transcribeAudio);

// Summarization API (AWS SageMaker)
router.post("/summarize", summarizeText);

// AWS Lambda for Audio Processing
router.post("/lambda/process-audio", processAudioLambda);

module.exports = router;
