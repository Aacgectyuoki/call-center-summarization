const express = require("express");
const multer = require("multer");
const path = require("path");

const transcriptionController = require("../controllers/transcriptionController");

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Routes
router.get("/", transcriptionController.getTranscriptions);
router.post("/", transcriptionController.createTranscription);

// File Upload Route with Processing
router.post("/upload", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const transcription = await transcriptionController.processTranscription(req.file.path);

        res.status(200).json({
            message: "File uploaded and transcribed successfully",
            fileUrl: `/uploads/${req.file.filename}`,
            transcription,
        });
    } catch (error) {
        res.status(500).json({ message: "Error processing file", error: error.message });
    }
});

module.exports = router;
