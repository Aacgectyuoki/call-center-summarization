const Transcription = require("../models/Transcription");
const { getSignedUrlForFile } = require("../utils/awsS3Utils");
const { generateSummary } = require("../controllers/summaryController"); // Use LangChain summarization
const { TranscribeClient, GetTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const { saveTranscriptionJob } = require("../utils/transcriptionUtils");

/**
 * 🚀 **Start Transcription Job**
 */
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
            fileId,
            s3Url: audioUrl,
        });
    } catch (error) {
        console.error("❌ Transcription Error:", error);
        res.status(500).json({ message: "Failed to start transcription", error: error.message });
    }
};

/**
 * 🎤 **Fetch Transcribed Text (Using AWS SDK, No Axios)**
 */
exports.getTranscriptionText = async (req, res) => {
    const { jobName } = req.query;

    if (!jobName) {
        return res.status(400).json({ message: "Job name is required" });
    }

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${jobName}.json`,
        });

        const { Body } = await s3Client.send(command);
        const transcriptionData = await streamToString(Body);

        const parsedData = JSON.parse(transcriptionData);
        const transcriptText = parsedData?.results?.transcripts[0]?.transcript || "";

        if (!transcriptText.trim()) {
            return res.status(400).json({ message: "No transcription found" });
        }

        res.status(200).json({ jobName, transcriptText });
    } catch (error) {
        console.error("❌ Error fetching transcription:", error);
        res.status(500).json({ message: "Failed to retrieve transcription", error: error.message });
    }
};

/**
 * 📝 **Summarize Transcription (Uses LangChain)**
 */
exports.summarizeTranscription = async (req, res) => {
    const { jobName, length = "regular", complexity = "regular", format = "regular" } = req.body;

    if (!jobName) {
        return res.status(400).json({ message: "Job name is required" });
    }

    try {
        // Use LangChain-based summarization
        const summary = await generateSummary({ jobName, length, complexity, format });

        res.status(200).json({
            jobName,
            summary,
        });
    } catch (error) {
        console.error("❌ Error summarizing transcription:", error);
        res.status(500).json({ message: "Failed to summarize transcription", error: error.message });
    }
};

/**
 * 📊 **Check Transcription Status**
 */
exports.checkTranscriptionStatus = async (req, res) => {
    const { jobName } = req.query;

    if (!jobName) {
        return res.status(400).json({ message: "Missing jobName parameter" });
    }

    try {
        const command = new GetTranscriptionJobCommand({ TranscriptionJobName: jobName });
        const response = await transcribeClient.send(command);

        if (!response.TranscriptionJob) {
            return res.status(404).json({ message: "Transcription job not found" });
        }

        res.status(200).json({
            jobName,
            status: response.TranscriptionJob.TranscriptionJobStatus,
            transcriptUrl: response.TranscriptionJob.Transcript?.TranscriptFileUri || null,
        });
    } catch (error) {
        console.error("❌ Error checking transcription status:", error);
        res.status(500).json({ message: "Failed to check transcription status", error: error.message });
    }
};

/**
 * 📥 **Utility: Convert AWS S3 Stream to String**
 */
const streamToString = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks).toString("utf8");
};
