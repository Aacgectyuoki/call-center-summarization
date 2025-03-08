const Transcription = require('../models/Transcription');
const { summarizeText } = require("../utils/summaryUtils");
const { exec } = require('child_process');

exports.getTranscriptions = async (req, res) => {
    try {
        const transcriptions = await Transcription.find().populate('callId');
        res.json(transcriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTranscription = async (req, res) => {
    try {
        const { callId, text, confidenceScore } = req.body;
        const newTranscription = new Transcription({ callId, text, confidenceScore });
        await newTranscription.save();
        res.status(201).json(newTranscription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Fix: Ensure function is correctly exported
exports.processTranscription = async (filePath) => {
    return new Promise((resolve, reject) => {
        exec(`whisper ${filePath} --model small`, async (error, stdout) => {
            if (error) return reject(error);

            const transcriptionText = stdout.trim();
            console.log("Transcription Output:", transcriptionText);

            // Generate summary using OpenAI
            const summaryText = await summarizeText(transcriptionText);

            // Save to MongoDB
            const newTranscription = new Transcription({
                audioFile: filePath,
                transcription: transcriptionText,
                summary: summaryText,
            });

            await newTranscription.save();
            resolve({ transcriptionText, summaryText });
        });
    });
};
