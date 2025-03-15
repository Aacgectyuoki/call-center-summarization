const Transcription = require("../models/Transcription");
const { getSignedUrlForFile } = require("../utils/awsS3Utils");
const { summarizeText } = require("../utils/openaiUtils");
const axios = require("axios");
// const { startTranscription } = require("../utils/awsTranscribeUtils");
const { TranscribeClient, GetTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");

const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION });


const { saveTranscriptionJob } = require("../utils/transcriptionUtils");

exports.transcribeAudio = async (req, res) => {
    try {
        const { audioUrl, fileId } = req.body;
        if (!audioUrl || !fileId) {
            return res.status(400).json({ message: "Audio URL and File ID are required" });
        }

        const jobName = `transcription-${Date.now()}`;

        // Save the transcription job with a consistent file ID
        await saveTranscriptionJob(jobName, fileId, audioUrl);

        res.status(200).json({
            message: "Transcription job started",
            jobName,
            fileId, // ✅ Keep this consistent
            s3Url: audioUrl, // ✅ Keep this consistent
        });
    } catch (error) {
        console.error("Transcription Error:", error);
        res.status(500).json({ message: "Failed to start transcription", error: error.message });
    }
};

/**
 * 📝 **Fetch Transcribed Text**
 * - Retrieves the transcription text from the S3 bucket.
 */
exports.getTranscriptionText = async (req, res) => {
    const { jobName } = req.query;

    if (!jobName) {
        return res.status(400).json({ message: "Job name is required" });
    }

    try {
        const fileName = `${jobName}.json`;
        const signedUrl = await getSignedUrlForFile(fileName);
        const response = await axios.get(signedUrl);

        const transcriptText = response.data.results.transcripts[0].transcript || "";
        if (!transcriptText) return res.status(400).json({ message: "No transcription found" });

        res.status(200).json({ jobName, transcriptText });
    } catch (error) {
        console.error("❌ Error fetching transcription:", error);
        res.status(500).json({ message: "Failed to retrieve transcription", error: error.message });
    }
};


exports.summarizeTranscription = async (req, res) => {
    const { jobName } = req.body;

    if (!jobName) {
        return res.status(400).json({ message: "Job name is required" });
    }

    try {
        // Get the transcription text
        const fileName = `${jobName}.json`;
        const signedUrl = await getSignedUrlForFile(fileName);
        const response = await axios.get(signedUrl);
        const transcriptText = response.data.results.transcripts[0].transcript;

        // Summarize the text
        const summary = await summarizeText(transcriptText);

        res.status(200).json({
            jobName,
            summary
        });
    } catch (error) {
        console.error("❌ Error summarizing transcription:", error);
        res.status(500).json({ message: "Failed to summarize transcription", error: error.message });
    }
};

exports.checkTranscriptionStatus = async (req, res) => {
    const { jobName } = req.query;
    console.log("Checking Transcription Status for:", jobName); // ✅ Debugging Log

    if (!jobName) {
        return res.status(400).json({ message: "Missing jobName parameter" });
    }

    try {
        const command = new GetTranscriptionJobCommand({ TranscriptionJobName: jobName });
        const response = await transcribeClient.send(command);
        console.log("AWS Transcribe Response:", response); // ✅ Debugging Log

        res.status(200).json({
            jobName,
            status: response.TranscriptionJob.TranscriptionJobStatus,
            transcriptUrl: response.TranscriptionJob.Transcript?.TranscriptFileUri || null,
        });
    } catch (error) {
        console.error("Error checking transcription status:", error);
        res.status(500).json({ message: "Failed to check transcription status", error: error.message });
    }
};



// exports.transcribeAudio = async (req, res) => {
//     try {
//         const { audioUrl } = req.body;
//         if (!audioUrl) {
//             return res.status(400).json({ message: "Audio URL is required" });
//         }

//         // Extract filename from S3 URL
//         const fileName = audioUrl.split("/").pop();
//         const jobName = `transcription-${Date.now()}`;

//         // Store transcription details in MongoDB before starting
//         const newTranscription = new Transcription({
//             jobId: jobName,
//             originalFileName: fileName,
//             s3FileName: audioUrl, // Store full S3 path
//             transcriptionStatus: "pending"
//         });

//         await newTranscription.save();

//         // Start transcription
//         const response = await startTranscription(audioUrl, jobName);

//         res.status(200).json({
//             message: "Transcription job started",
//             jobName,
//             response
//         });
//     } catch (error) {
//         console.error("Transcription Error:", error);
//         res.status(500).json({ message: "Failed to start transcription", error: error.message });
//     }
// };
