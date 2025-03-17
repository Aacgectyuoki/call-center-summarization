const express = require("express");
const multer = require("multer");
const { triggerLambdaTranscription } = require("../utils/awsLambdaUtils");
const { generateSummary } = require("../controllers/summaryController");
const { processAudioLambda } = require("../controllers/awsLambdaController");
const { uploadAudio, getTranscriptionUrl, getS3FileUrl } = require("../controllers/awsS3Controller");
const { transcribeAudio, checkTranscriptionStatus, getTranscriptionText, summarizeTranscription } = require("../controllers/transcriptionController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload file to AWS S3 and start transcription
router.post("/upload", upload.single("file"), uploadAudio);

// S3 file URL
router.get("/s3-url", getS3FileUrl);

// Get public S3 URL for a transcription job
router.get("/s3-url", getTranscriptionUrl);

// AWS Transcribe - Start Transcription
router.post("/transcribe", transcribeAudio);

// Summarization API (GPT-4)
router.post("/summarize", generateSummary);

// AWS Lambda for Audio Processing
router.post("/lambda/process-audio", processAudioLambda);

// Check Transcription Status
router.get("/transcription-status", checkTranscriptionStatus);

// Fetch Transcription Text
router.get("/transcription-text", getTranscriptionText);

module.exports = router;
