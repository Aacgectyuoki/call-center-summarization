const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");

dotenv.config();

// AWS S3 Configuration
const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    },
    region: process.env.AWS_REGION || ""
});

// Multer storage setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Uploads a file to AWS S3 and returns the file ID.
 */
const uploadFileToS3 = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file provided" });
        }

        const fileId = uuidv4(); // Generate unique file ID
        const fileName = `${fileId}-${req.file.originalname}`;
        
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        };
        const command = new PutObjectCommand(params);
        const uploadResult = await s3Client.send(command);
        // Upload file to S3
        // const uploadResult = await s3.upload(params).promise();

        // Construct the S3 URL manually
        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        // Respond with file ID and S3 URL
        res.json({
            fileId: fileId, // This ID will be used for transcription
            fileUrl: fileUrl
        });

    } catch (error) {
        console.error("Error uploading file to S3:", error);
        res.status(500).json({ error: "Error uploading file" });
    }
};

module.exports = { upload, uploadFileToS3 };
