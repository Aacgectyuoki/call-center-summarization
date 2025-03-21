const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

const s3Client = new S3Client({ region: process.env.AWS_REGION });

async function uploadFileToS3(fileBuffer, fileName, fileType) {
    const bucketName = process.env.S3_BUCKET_NAME;

    if (!bucketName) {
        throw new Error("S3_BUCKET_NAME environment variable is not defined");
    }

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: fileType,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw new Error("Error uploading file to S3");
    }
}

async function getSignedUrlForFile(fileName) {
    const bucketName = process.env.S3_BUCKET_NAME;

    if (!bucketName) {
        throw new Error("S3_BUCKET_NAME environment variable is not defined");
    }

    const params = {
        Bucket: bucketName,
        Key: fileName,
    };

    try {
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return url;
    } catch (error) {
        console.error("Error getting signed URL from S3:", error);
        throw new Error("Error getting signed URL from S3");
    }
}

/**
 * ✅ Fetch transcription from S3
 */
async function fetchS3File(bucket, key) {
    try {
        console.log("📡 Fetching S3 file:", key);

        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const response = await s3Client.send(command);

        const streamToString = async (stream) => {
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks).toString("utf8");
        };

        const data = await streamToString(response.Body);
        return JSON.parse(data).results.transcripts.map(t => t.transcript).join(" ");
    } catch (error) {
        console.error("❌ S3 Fetch Error:", error);
        throw new Error("Failed to fetch transcription data");
    }
}

module.exports = { uploadFileToS3, getSignedUrlForFile, fetchS3File };
