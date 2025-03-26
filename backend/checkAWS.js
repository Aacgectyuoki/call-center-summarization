require("dotenv").config();
const AWS = require("aws-sdk");

// Load credentials from .env file
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// Check if the credentials work by listing S3 buckets
s3.listBuckets((err, data) => {
    if (err) {
        console.error("AWS Credentials Error:", err);
    } else {
        console.log("AWS Credentials are valid. S3 Buckets:", data.Buckets);
    }
});
