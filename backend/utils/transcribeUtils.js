const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();
const FormData = require("form-data");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions";

/**
 * Transcribes an audio file using OpenAI's Whisper API.
 * @param {string} filePath - Path to the audio file.
 * @returns {Promise<Object>} - Transcription result with text and confidence.
 */
async function transcribeAudio(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const audioData = fs.createReadStream(filePath);

        const formData = new FormData();
        formData.append("file", audioData);
        formData.append("model", "whisper-1"); // OpenAI's Whisper model
        formData.append("language", "en"); // Specify language if known (optional)

        const response = await axios.post(OPENAI_WHISPER_URL, formData, {
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                ...formData.getHeaders()
            }
        });

        return {
            transcription: response.data.text,
            status: "completed"
        };
    } catch (error) {
        console.error("Error during transcription:", error);
        return { transcription: null, status: "failed", error: error.message };
    }
}

/**
 * Processes the transcription results.
 * @param {Object} transcriptionData - The transcription data to process.
 * @returns {Promise<void>}
 */
async function processTranscription(transcriptionData) {
    try {
        const { jobName, status, results } = transcriptionData;

        if (status !== 'COMPLETED') {
            throw new Error("Transcription job not completed");
        }

        const transcriptionText = results.transcripts[0].transcript;

        // Save or process the transcription text as needed
        // For example, save to a database or file
        console.log(`Transcription for job ${jobName}: ${transcriptionText}`);
    } catch (error) {
        console.error("Error processing transcription:", error);
        throw error;
    }
}

module.exports = { transcribeAudio, processTranscription };