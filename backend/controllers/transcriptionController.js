const Transcription = require("../models/Transcription");
const { transcribeAudio } = require("../utils/transcribeUtils");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

/**
 * Handles audio file upload and transcription.
 */
const uploadAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        const filePath = req.file.path; // Path to uploaded file

        // Transcribe the audio using OpenAI Whisper
        const transcriptionResult = await transcribeAudio(filePath);

        if (transcriptionResult.status === "failed") {
            return res.status(500).json({ error: "Transcription failed.", details: transcriptionResult.error });
        }

        // Save the transcription in MongoDB
        const newTranscription = new Transcription({
            audioFile: req.file.filename,
            transcription: transcriptionResult.transcription,
            status: "completed"
        });

        await newTranscription.save();

        // Remove the audio file after processing (optional)
        fs.unlinkSync(filePath);

        return res.status(201).json({
            message: "Transcription completed successfully.",
            transcription: newTranscription
        });

    } catch (error) {
        console.error("Error processing transcription:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

/**
 * Retrieves all transcriptions from the database.
 */
const getTranscriptions = async (req, res) => {
    try {
        const transcriptions = await Transcription.find().sort({ createdAt: -1 });
        return res.status(200).json(transcriptions);
    } catch (error) {
        console.error("Error fetching transcriptions:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

/**
 * Retrieves a single transcription by ID.
 */
const getTranscriptionById = async (req, res) => {
    try {
        const transcription = await Transcription.findById(req.params.id);
        if (!transcription) {
            return res.status(404).json({ error: "Transcription not found." });
        }
        return res.status(200).json(transcription);
    } catch (error) {
        console.error("Error fetching transcription:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = {
    upload,
    uploadAudio,
    getTranscriptions,
    getTranscriptionById
};


// const Transcription = require('../models/Transcription');
// const { summarizeText } = require("../utils/summaryUtils");
// const { exec } = require('child_process');

// exports.getTranscriptions = async (req, res) => {
//     try {
//         const transcriptions = await Transcription.find().populate('callId');
//         res.json(transcriptions);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// exports.createTranscription = async (req, res) => {
//     try {
//         const { callId, text, confidenceScore } = req.body;
//         const newTranscription = new Transcription({ callId, text, confidenceScore });
//         await newTranscription.save();
//         res.status(201).json(newTranscription);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// // Fix: Ensure function is correctly exported
// exports.processTranscription = async (filePath) => {
//     return new Promise((resolve, reject) => {
//         exec(`whisper ${filePath} --model small`, async (error, stdout) => {
//             if (error) return reject(error);

//             const transcriptionText = stdout.trim();
//             console.log("Transcription Output:", transcriptionText);

//             // Generate summary using OpenAI
//             const summaryText = await summarizeText(transcriptionText);

//             // Save to MongoDB
//             const newTranscription = new Transcription({
//                 audioFile: filePath,
//                 transcription: transcriptionText,
//                 summary: summaryText,
//             });

//             await newTranscription.save();
//             resolve({ transcriptionText, summaryText });
//         });
//     });
// };
