const AWS = require("aws-sdk");
const { uploadFileToS3 } = require("../utils/awsS3Utils");
const { startTranscriptionJob } = require("./awsTranscribeController");

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "dtsummarizr-audio1";
const REGION = process.env.AWS_REGION || "us-east-1";

// Configure AWS S3
const s3 = new AWS.S3({
    region: REGION,
    signatureVersion: "v4",
});

/**
 * Uploads an audio file to S3 and starts transcription.
 */
const uploadAudio = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: "No file uploaded" });

        // Upload the file to S3
        const s3Url = await uploadFileToS3(file.buffer, file.originalname, file.mimetype);

        // Start Transcription
        const transcriptionJobId = await startTranscriptionJob(s3Url);

        res.json({ message: "File uploaded and transcription started", transcriptionJobId });
    } catch (error) {
        console.error("S3 Upload Error:", error);
        res.status(500).json({ error: "Failed to upload file" });
    }
};

/**
 * Generates a public URL for an S3 object (signed or direct).
 */
const getTranscriptionUrl = async (req, res) => {
    try {
        const { jobName } = req.query;
        if (!jobName) return res.status(400).json({ error: "Job name is required" });

        const fileKey = `${jobName}.json`;

        // Use a Signed URL (valid for 1 hour) - more secure
        const params = {
            Bucket: S3_BUCKET_NAME,
            Key: fileKey,
            Expires: 3600, // 1 hour expiration
        };

        const url = await s3.getSignedUrlPromise("getObject", params);

        res.json({ s3Url: url });
    } catch (error) {
        console.error("Error generating S3 URL:", error);
        res.status(500).json({ error: "Failed to generate S3 URL" });
    }
};

const getS3FileUrl = async (req, res) => {
    try {
        const { jobName } = req.query;  // Extract jobName from query
        if (!jobName) {
            return res.status(400).json({ error: "Missing jobName parameter" });
        }

        // Construct the S3 URL
        const s3Bucket = process.env.S3_BUCKET_NAME || "dtsummarizr-audio1";
        const awsRegion = process.env.AWS_REGION || "us-east-1";

        const s3Url = `https://${s3Bucket}.s3.${awsRegion}.amazonaws.com/${jobName}.json`;

        res.json({ s3Url });  // Send back the generated S3 URL
    } catch (error) {
        console.error("Error generating S3 URL:", error);
        res.status(500).json({ error: "Failed to generate S3 URL" });
    }
};

module.exports = { uploadAudio, getTranscriptionUrl, getS3FileUrl };
