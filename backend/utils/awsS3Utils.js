const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { generateFileName } = require("./fileHandler"); // Import function
require("dotenv").config();

const s3Client = new S3Client({ region: process.env.AWS_REGION });

async function uploadFileToS3(fileBuffer, originalName, fileType, userId = "guest") {
    const bucketName = process.env.S3_BUCKET_NAME;

    if (!bucketName) {
        throw new Error("S3_BUCKET_NAME environment variable is not defined");
    }

    // Generate a unique filename using user ID if available
    const fileName = generateFileName(originalName, userId);

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: fileType,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        return `s3://${bucketName}/${fileName}`; // ✅ Ensure S3 URI format
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw new Error("Error uploading file to S3");
    }
}

module.exports = { uploadFileToS3 };