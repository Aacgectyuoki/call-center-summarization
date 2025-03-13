const AWS = require("@aws-sdk/client-transcribe")

const { TranscribeClient, StartTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
require("dotenv").config();

const region = process.env.AWS_REGION;
const bucketName = process.env.S3_BUCKET_NAME;

if (!region || !bucketName) {
    throw new Error("AWS configuration environment variables are not set");
}

const transcribeClient = new TranscribeClient({ region });

const startTranscription = async (audioUrl, jobName) => {
    const params = {
        TranscriptionJobName: jobName,
        LanguageCode: "en-US", // Adjust as needed
        MediaFormat: "mp3", // Change based on your file format (wav, mp4, etc.)
        Media: {
            MediaFileUri: audioUrl, // S3 URL of uploaded audio
        },
        OutputBucketName: bucketName, // Store transcript in the same bucket
    };

    try {
        const command = new StartTranscriptionJobCommand(params);
        await transcribeClient.send(command);
        return { message: "Transcription started successfully", jobName };
    } catch (error) {
        console.error("Error starting transcription:", error);
        throw new Error("Failed to start transcription");
    }
};

module.exports = { startTranscription };

// const AWS = require("aws-sdk");
// const fs = require("fs");
// const path = require("path");

// AWS.config.update({ region: "us-east-1" });

// const transcribeService = new AWS.TranscribeService();

// exports.startTranscription = async (s3Uri, jobName) => {
//     const params = {
//         TranscriptionJobName: jobName,
//         LanguageCode: "en-US", // Change if needed
//         MediaFormat: "mp3", // Change if needed
//         Media: { MediaFileUri: s3Uri },
//         OutputBucketName: process.env.S3_BUCKET_NAME // Replace with actual S3 bucket name
//     };

//     try {
//         await transcribeService.startTranscriptionJob(params).promise();
//         return { message: "Transcription job started", jobName };
//     } catch (error) {
//         throw new Error("Error starting transcription: " + error.message);
//     }
// };

// exports.saveTranscription = (transcriptText) => {
//     const filePath = path.join(__dirname, "transcriptions", `${Date.now()}.txt`);
//     fs.writeFileSync(filePath, transcriptText, "utf8");
//     console.log(`Transcription saved to ${filePath}`);
// };