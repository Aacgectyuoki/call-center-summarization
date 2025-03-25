const { S3Client } = require("@aws-sdk/client-s3");
const { CloudWatchLogsClient } = require("@aws-sdk/client-cloudwatch-logs");
require("dotenv").config();

// Validate Environment Variables
const requiredEnvVars = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_CLOUDWATCH_LOG_GROUP"];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.warn(`⚠️ WARNING: Missing environment variable ${envVar}`);
    }
});

// S3 Configuration
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

// CloudWatch Configuration
const cloudWatchClient = new CloudWatchLogsClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

module.exports = { s3, cloudWatchClient };
