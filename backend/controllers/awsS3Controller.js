const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { uploadFileToS3 } = require("../utils/awsS3Utils");
const { startTranscriptionJob } = require("./awsTranscribeController");
const path = require("path");
const fs = require("fs");

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "dtsummarizr-audio1";
const REGION = process.env.AWS_REGION || "us-east-1";

// ✅ Use AWS SDK v3
const s3Client = new S3Client({ region: REGION });

/**
 * ✅ Uploads an audio file to S3 and starts transcription.
 */
const uploadAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const file = req.file;
        const localFilePath = path.join(__dirname, "../uploads", file.filename);
        console.log("📂 Local File Path:", localFilePath);

        if (!fs.existsSync(localFilePath)) {
            return res.status(500).json({ error: "File was not saved correctly" });
        }

        const s3Url = await uploadFileToS3(file);
        console.log("☁️ File uploaded to S3:", s3Url);

        if (!s3Url) {
            return res.status(500).json({ error: "Failed to upload file to S3" });
        }

        // ✅ Pass localFilePath to transcription
        const transcriptionJobId = await startTranscriptionJob(s3Url, localFilePath);

        res.json({
            message: "File uploaded and transcription started",
            transcriptionJobId,
        });

    } catch (error) {
        console.error("S3 Upload Error:", error);
        res.status(500).json({ error: "Failed to upload file" });
    }
};

/**
 * ✅ Generates a signed URL for an S3 object.
 */
const getTranscriptionUrl = async (req, res) => {
    try {
        const { jobName } = req.query;
        if (!jobName) return res.status(400).json({ error: "Job name is required" });

        const fileKey = `${jobName}.json`;

        // ✅ Use AWS SDK v3 Presigned URL
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: fileKey,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({ s3Url: url });
    } catch (error) {
        console.error("Error generating S3 URL:", error);
        res.status(500).json({ error: "Failed to generate S3 URL" });
    }
};

/**
 * ✅ Returns a direct S3 file URL (not signed)
 */
const getS3FileUrl = async (req, res) => {
    try {
        const { jobName } = req.query;
        if (!jobName) {
            return res.status(400).json({ error: "Missing jobName parameter" });
        }

        // ✅ Construct the direct S3 URL
        const s3Url = `https://${S3_BUCKET_NAME}.s3.${REGION}.amazonaws.com/${jobName}.json`;

        res.json({ s3Url });
    } catch (error) {
        console.error("Error generating S3 URL:", error);
        res.status(500).json({ error: "Failed to generate S3 URL" });
    }
};

module.exports = { uploadAudio, getTranscriptionUrl, getS3FileUrl };
