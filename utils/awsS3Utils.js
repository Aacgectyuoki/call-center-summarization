const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const path = require("path");

const s3Client = new S3Client({ region: process.env.AWS_REGION });

/**
 * Uploads file to AWS S3
 */
const uploadFileToS3 = async (file) => {
    try {
        if (!file) {
            throw new Error("No file provided");
        }

        // ✅ Generate a unique file key
        const fileKey = `uploads/${Date.now()}-${path.basename(file.originalname)}`;

        console.log(`☁️ Uploading file to S3: ${fileKey}`);

        // ✅ Read the file from local storage
        const fileStream = fs.createReadStream(file.path);

        // ✅ Upload to S3
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME, // ✅ Ensure the bucket name is correct
            Key: fileKey,  // ✅ Ensure Key is set correctly
            Body: fileStream,
            ContentType: file.mimetype
        }));

        console.log("✅ S3 Upload Success:", fileKey);

        // ✅ Return the S3 URL
        return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    } catch (error) {
        console.error("❌ Error uploading file to S3:", error);
        throw new Error("Error uploading file to S3");
    }
};

/**
 * Generates a signed URL for a file in AWS S3
 */
const getSignedUrlForFile = async (bucketName, key) => {
    try {
        const command = new PutObjectCommand({ Bucket: bucketName, Key: key });
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
        return signedUrl;
    } catch (error) {
        console.error("❌ Error generating signed URL:", error);
        throw new Error("Failed to generate signed URL");
    }
};

module.exports = { uploadFileToS3, getSignedUrlForFile };
