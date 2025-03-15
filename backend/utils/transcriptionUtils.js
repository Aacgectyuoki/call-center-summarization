const { getDB } = require("../config/db");

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

module.exports = { saveTranscriptionJob };
