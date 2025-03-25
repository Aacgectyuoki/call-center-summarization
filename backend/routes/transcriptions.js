const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const { checkTranscriptionStatus } = require("../controllers/transcriptionController");
const { getTranscriptionText } = require("../controllers/transcriptionController");

const router = express.Router();

// Route to check transcription status
router.get("/transcription-status", checkTranscriptionStatus);

router.get("/transcription-text", getTranscriptionText);

router.get("/:id", authenticateUser);

module.exports = router;