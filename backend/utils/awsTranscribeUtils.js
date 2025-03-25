const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
require("dotenv").config();
const envConfig = require("../config/envConfig");

const region = process.env.AWS_REGION;
const bucketName = process.env.S3_BUCKET_NAME;

if (!region || !bucketName) {
    throw new Error("AWS configuration environment variables are not set");
}

const transcribeClient = new TranscribeClient({ region: envConfig.AWS_REGION });

/**
 * Start AWS Transcribe job
 */
const startTranscription = async (audioUrl, jobName) => {
    const params = {
        TranscriptionJobName: jobName,
        LanguageCode: "en-US",
        MediaFormat: "mp3",
        Media: { MediaFileUri: audioUrl },
        OutputBucketName: envConfig.S3_BUCKET_NAME
    };

    try {
        const command = new StartTranscriptionJobCommand(params);
        await transcribeClient.send(command);
        console.log(`✅ Transcription job started: ${jobName}`);
        return { message: "Transcription started successfully", jobName };
    } catch (error) {
        console.error("❌ Transcription error:", error);
        throw new Error("Failed to start transcription job");
    }
};

/**
 * Get the status of an AWS Transcription job
 */
const getTranscriptionJobStatus = async (jobName) => {
    try {
        const command = new GetTranscriptionJobCommand({ TranscriptionJobName: jobName });
        const response = await transcribeClient.send(command);
        return response.TranscriptionJob.TranscriptionJobStatus; // Returns "IN_PROGRESS", "COMPLETED", or "FAILED"
    } catch (error) {
        console.error("❌ Error fetching transcription job status:", error);
        return "FAILED"; // Return FAILED if an error occurs
    }
};

module.exports = { startTranscription, getTranscriptionJobStatus };
