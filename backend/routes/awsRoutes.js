const express = require("express");
const multer = require("multer");
const { transcribeAudio } = require("../controllers/transcriptionController");
const { triggerLambdaTranscription } = require("../utils/awsLambdaUtils");
const { generateSummary } = require("../controllers/summaryController");
const { processAudioLambda } = require("../controllers/awsLambdaController");
const { uploadAudio } = require("../controllers/awsS3Controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// AWS Transcribe - Start Transcription
router.post("/transcribe", transcribeAudio);

// Summarization API (GPT-4)
router.post("/summarize", generateSummary);

// AWS Lambda for Audio Processing
router.post("/lambda/process-audio", processAudioLambda);

// Upload file to AWS S3 and start transcription
router.post("/upload", upload.single("file"), uploadAudio);

module.exports = router;
