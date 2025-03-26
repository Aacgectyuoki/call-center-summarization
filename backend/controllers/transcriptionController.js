const { getSignedUrlForFile } = require("../utils/awsS3Utils");
const axios = require("axios");
const { TranscribeClient, GetTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
const { generateSummary } = require("./summaryController"); // Use LangChain summarization

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
            fileId,
            s3Url: audioUrl,
        });
    } catch (error) {
        console.error("Transcription Error:", error);
        res.status(500).json({ message: "Failed to start transcription", error: error.message });
    }
};

/**
 * Fetch Transcribed Text
 * Retrieves the transcription text from the S3 bucket.
 */
exports.getTranscriptionText = async (req, res) => {
    const { jobName } = req.query;

    if (!jobName) {
        return res.status(400).json({ message: "Job name is required" });
    }

    try {
        console.log(`📡 Fetching transcription for job: ${jobName}`);

        const fileName = `transcriptions/${jobName}.json`;  // 🔍 Ensure the correct key format
        console.log(`🗂️ Using file path: ${fileName}`);

        const signedUrl = await getSignedUrlForFile(process.env.S3_BUCKET_NAME, fileName);
        console.log(`✅ Signed URL: ${signedUrl}`);

        const response = await axios.get(signedUrl);
        const transcriptText = response.data.results.transcripts[0].transcript || "";

        if (!transcriptText) {
            return res.status(400).json({ message: "No transcription found" });
        }

        res.status(200).json({ jobName, transcriptText });
    } catch (error) {
        console.error("❌ Error fetching transcription:", error);
        res.status(500).json({ message: "Failed to retrieve transcription", error: error.message });
    }
};


/**
 * Summarize Transcription (Now uses LangChain)
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
        console.error("Error summarizing transcription:", error);
        res.status(500).json({ message: "Failed to summarize transcription", error: error.message });
    }
};

/**
 * Check Transcription Status
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
        res.status(500).json({ message: "Failed to check transcription status" });
    }
};
