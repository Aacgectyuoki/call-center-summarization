const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
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

        console.log(`📂 Local File Path: ${file.path}`);

        // ✅ Ensure the file exists before uploading
        if (!fs.existsSync(file.path)) {
            throw new Error(`❌ File does not exist at path: ${file.path}`);
        }

        const fileKey = `uploads/${Date.now()}-${file.originalname}`;
        console.log(`☁️ Uploading file to S3: ${fileKey}`);

        const fileStream = fs.createReadStream(file.path);

        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
            Body: fileStream,
            ContentType: file.mimetype
        }));

        console.log("✅ S3 Upload Success:", fileKey);
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
        if (!key) {
            throw new Error("Missing Key: No value provided for input HTTP label.");
        }

        console.log(`🔍 Generating signed URL for bucket: ${bucketName}, key: ${key}`);

        const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        console.log(`✅ Signed URL generated: ${signedUrl}`);
        return signedUrl;
    } catch (error) {
        console.error("❌ Error generating signed URL:", error);
        throw new Error("Failed to generate signed URL");
    }
};


module.exports = { uploadFileToS3, getSignedUrlForFile };
