const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadAudio } = require("../controllers/awsS3Controller");

const upload = multer({ storage: multer.memoryStorage() });

// Upload file to AWS S3 and start transcription
router.post("/upload", upload.single("file"), uploadAudio);

module.exports = router;