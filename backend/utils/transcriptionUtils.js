const { getDB } = require("../config/db");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../config/awsConfig");

/**
 * Save transcription job details in MongoDB
 */
const saveTranscriptionJob = async (jobId, originalFileName, s3FileName) => {
    try {
        const db = getDB(); // Ensure DB is initialized
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

/**
 * Retrieve transcript file from S3 based on job name
 */
const getTranscriptByJobName = async (jobName) => {
    try {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${jobName}.json`,  // Transcription result stored in S3
        };

        const command = new GetObjectCommand(params);
        const response = await s3.send(command);

        // Convert stream response to string
        const streamToString = (stream) => {
            return new Promise((resolve, reject) => {
                const chunks = [];
                stream.on("data", (chunk) => chunks.push(chunk));
                stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
                stream.on("error", reject);
            });
        };

        const transcriptData = await streamToString(response.Body);
        const transcript = JSON.parse(transcriptData).transcript;
        
        return transcript;
    } catch (error) {
        console.error("❌ Error fetching transcript from S3:", error);
        throw new Error("Failed to fetch transcript from S3");
    }
};

module.exports = { saveTranscriptionJob, getTranscriptByJobName };
