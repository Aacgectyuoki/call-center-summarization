// const fs = require("fs");
// const axios = require("axios");
// require("dotenv").config();
// const FormData = require("form-data");

// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// const OPENAI_WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions";

// /**
//  * List of common filler words to remove from transcription.
//  */
// const FILLER_WORDS = new Set([
//     "um", "uh", "like", "actually", "basically",
//     "sort of", "kind of", "literally", "honestly", "anyway", "hmm"
// ]);

// /**
//  * Removes filler words from the transcription.
//  * @param {string} text - The raw transcription text.
//  * @returns {string} - Cleaned transcription text.
//  */
// function cleanTranscription(text) {
//     return text
//         .split(/\s+/) // Split into words
//         .filter(word => !FILLER_WORDS.has(word.toLowerCase())) // Remove filler words
//         .join(" ") // Reconstruct the sentence
//         .replace(/\s+([.,!?])/g, "$1") // Remove unnecessary spaces before punctuation
//         .trim();
// }

// /**
//  * Transcribes an audio file using OpenAI's Whisper API and removes filler words.
//  * @param {string} filePath - Path to the audio file.
//  * @returns {Promise<Object>} - Transcription result with cleaned text.
//  */
// async function transcribeAudio(filePath) {
//     try {
//         if (!fs.existsSync(filePath)) {
//             throw new Error(`File not found: ${filePath}`);
//         }

//         const audioData = fs.createReadStream(filePath);

//         const formData = new FormData();
//         formData.append("file", audioData);
//         formData.append("model", "whisper-1");
//         formData.append("language", "en");

//         const response = await axios.post(OPENAI_WHISPER_URL, formData, {
//             headers: {
//                 "Authorization": `Bearer ${OPENAI_API_KEY}`,
//                 ...formData.getHeaders()
//             }
//         });

//         const rawTranscription = response.data.text;
//         const cleanedTranscription = cleanTranscription(rawTranscription);

//         return {
//             transcription: cleanedTranscription,
//             status: "completed"
//         };
//     } catch (error) {
//         console.error("Error during transcription:", error);
//         return { transcription: null, status: "failed", error: error.message };
//     }
// }

// /**
//  * Processes the transcription results and ensures clean storage.
//  * @param {Object} transcriptionData - The transcription data to process.
//  * @returns {Promise<void>}
//  */
// async function processTranscription(transcriptionData) {
//     try {
//         const { jobName, status, results } = transcriptionData;

//         if (status !== 'COMPLETED') {
//             throw new Error("Transcription job not completed");
//         }

//         let transcriptionText = results.transcripts[0].transcript;
//         transcriptionText = cleanTranscription(transcriptionText);

//         console.log(`✅ Cleaned Transcription for job ${jobName}: ${transcriptionText}`);
//     } catch (error) {
//         console.error("Error processing transcription:", error);
//         throw error;
//     }
// }

// module.exports = { transcribeAudio, processTranscription };