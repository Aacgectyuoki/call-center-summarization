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
    // const jobName = `transcription-${Date.now()}`; // Generate unique name
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

module.exports = { saveTranscriptionJob };

// const pollTranscriptionJob = async (jobName) => {
//     while (true) {
//         const command = new GetTranscriptionJobCommand({ TranscriptionJobName: jobName });
//         const response = await transcribeClient.send(command);

//         const status = response.TranscriptionJob.TranscriptionJobStatus;
//         if (status === "COMPLETED") {
//             return response.TranscriptionJob.Transcript.TranscriptFileUri;
//         }
//         if (status === "FAILED") {
//             throw new Error("Transcription job failed");
//         }

//         console.log("Waiting for transcription...");
//         await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 sec
//     }
// };
// const startTranscription = async (audioUrl, jobName) => {
//     const params = {
//         TranscriptionJobName: jobName,
//         LanguageCode: LanguageCode.EN_US, // Use the LanguageCode enum
//         MediaFormat: MediaFormat.MP3, // Use the MediaFormat enum
//         Media: {
//             MediaFileUri: audioUrl, // S3 URL of uploaded audio
//         },
//         OutputBucketName: bucketName, // Store transcript in the same bucket
//     };

//     try {
//         const command = new StartTranscriptionJobCommand(params);
//         await transcribeClient.send(command);
//         return { message: "Transcription started successfully", jobName };
//     } catch (error) {
//         console.error("Error starting transcription:", error);
//         throw new Error("Failed to start transcription");
//     }
// };

module.exports = { startTranscription };
    // , pollTranscriptionJob };