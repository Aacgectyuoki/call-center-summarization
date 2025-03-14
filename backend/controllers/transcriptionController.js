const Transcription = require("../models/Transcription");
const { startTranscription } = require("../utils/awsTranscribeUtils");

const transcribeAudio = async (req, res) => {
    try {
        const { audioUrl } = req.body; // Get S3 audio file URL from request
        if (!audioUrl) {
            return res.status(400).json({ error: "Audio file URL is required" });
        }

        const jobName = `transcription-${Date.now()}`;
        const response = await startTranscription(audioUrl, jobName);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: "Transcription failed" });
    }
};

const getTranscription = async (req, res) => {
    try {
        const transcriptionId = req.params.id;

        if (!transcriptionId) {
            return res.status(400).json({ error: "No transcription ID provided" });
        }

        // Fetch transcription from database (MongoDB)
        const transcription = await Transcription.findById(transcriptionId);
        if (!transcription) {
            return res.status(404).json({ error: "Transcription not found" });
        }

        res.json(transcription);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch transcription" });
    }
};

module.exports = { transcribeAudio, getTranscription };

// const Transcription = require("../models/Transcription");
// const { transcribeAudio } = require("../utils/transcribeUtils");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Configure Multer for file uploads
// const upload = multer({ dest: "uploads/" });

// /**
//  * Handles audio file upload and transcription.
//  */
// const uploadAudio = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "No file uploaded." });
//         }

//         const filePath = req.file.path; // Path to uploaded file

//         // Transcribe the audio using OpenAI Whisper
//         const transcriptionResult = await transcribeAudio(filePath);

//         if (transcriptionResult.status === "failed") {
//             return res.status(500).json({ error: "Transcription failed.", details: transcriptionResult.error });
//         }

//         // Save the transcription in MongoDB
//         const newTranscription = new Transcription({
//             audioFile: req.file.filename,
//             transcription: transcriptionResult.transcription,
//             status: "completed"
//         });

//         await newTranscription.save();

//         // Remove the audio file after processing (optional)
//         fs.unlinkSync(filePath);

//         return res.status(201).json({
//             message: "Transcription completed successfully.",
//             transcription: newTranscription
//         });

//     } catch (error) {
//         console.error("Error processing transcription:", error);
//         return res.status(500).json({ error: "Internal server error." });
//     }
// };

// /**
//  * Retrieves all transcriptions from the database.
//  */
// const getTranscriptions = async (req, res) => {
//     try {
//         const transcriptions = await Transcription.find().sort({ createdAt: -1 });
//         return res.status(200).json(transcriptions);
//     } catch (error) {
//         console.error("Error fetching transcriptions:", error);
//         return res.status(500).json({ error: "Internal server error." });
//     }
// };

// /**
//  * Retrieves a single transcription by ID.
//  */
// const getTranscriptionById = async (req, res) => {
//     try {
//         const transcription = await Transcription.findById(req.params.id);
//         if (!transcription) {
//             return res.status(404).json({ error: "Transcription not found." });
//         }
//         return res.status(200).json(transcription);
//     } catch (error) {
//         console.error("Error fetching transcription:", error);
//         return res.status(500).json({ error: "Internal server error." });
//     }
// };

// /**
//  * Creates a new transcription.
//  */
// const createTranscription = async (req, res) => {
//     try {
//         const { audioFile, transcriptionText } = req.body;

//         const transcription = new Transcription({
//             audioFile,
//             transcription: transcriptionText,
//             createdAt: new Date(),
//         });

//         await transcription.save();
//         res.status(201).json({ message: "Transcription created successfully", transcription });
//     } catch (error) {
//         res.status(500).json({ message: "Error creating transcription", error });
//     }
// };

// module.exports = {
//     upload,
//     uploadAudio,
//     getTranscriptions,
//     getTranscriptionById,
//     createTranscription,
//     transcribeAudio
// };