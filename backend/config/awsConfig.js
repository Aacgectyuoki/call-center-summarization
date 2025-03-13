const AWS = require("aws-sdk");
require("dotenv").config(); // Load .env variables

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// AWS Services
const s3 = new AWS.S3(); // S3 for file storage
const transcribeService = new AWS.TranscribeService(); // AWS Transcribe
const lambda = new AWS.Lambda(); // AWS Lambda
const sagemaker = new AWS.SageMakerRuntime(); // AWS SageMaker for AI summarization

module.exports = {
  s3,
  transcribeService,
  lambda,
  sagemaker,
};
