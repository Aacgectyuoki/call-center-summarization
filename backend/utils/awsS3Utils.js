const AWS = require('@aws-sdk/client-s3');
const s3 = new AWS.S3();

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
        const data = await s3.upload(params).promise();
        return data.Location; // Returns the file URL
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("Failed to upload file to S3");
    }
}

module.exports = { uploadFileToS3, s3 };