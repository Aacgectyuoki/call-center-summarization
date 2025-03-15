const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand, LanguageCode, MediaFormat } = require("@aws-sdk/client-transcribe");
require("dotenv").config();
const envConfig = require("../config/envConfig");

const { getDB } = require("../config/db");

const region = process.env.AWS_REGION;
const bucketName = process.env.S3_BUCKET_NAME;

if (!region || !bucketName) {
    throw new Error("AWS configuration environment variables are not set");
}

const transcribeClient = new TranscribeClient({ region: envConfig.AWS_REGION });

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
        return { message: "Transcription started successfully", jobName }; // Return job name for tracking
    } catch (error) {
        console.error("❌ Transcription error:", error);
        throw new Error("Failed to start transcription job");
    }
};

const saveTranscriptionJob = async (jobId, originalFileName, s3FileName) => {
    try {
        const db = getDB();
        const transcriptionCollection = db.collection("transcriptions");

        const newTranscription = {
            jobId,
            originalFileName,
            s3FileName,
            createdAt: new Date(),
        };

        const result = await transcriptionCollection.insertOne(newTranscription);
        console.log("✅ Transcription saved:", result.insertedId);
        return result;
    } catch (error) {
        console.error("❌ Failed to save transcription job:", error);
        throw new Error("Database insertion failed");
    }
};

module.exports = { saveTranscriptionJob, startTranscription };