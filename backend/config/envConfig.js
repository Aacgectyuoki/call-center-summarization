require("dotenv").config(); // Load .env variables

const envConfig = {
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/dtsummarizr",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "",
  AWS_TRANSCRIBE_LANGUAGE: process.env.AWS_TRANSCRIBE_LANGUAGE || "en-US",
  TRANSCRIBE_LAMBDA: process.env.TRANSCRIBE_LAMBDA || "startTranscription",
  SUMMARY_LAMBDA: process.env.SUMMARY_LAMBDA || "generateSummary",
  PROCESS_TRANSCRIPTION_LAMBDA: process.env.PROCESS_TRANSCRIPTION_LAMBDA || "processTranscriptionJob",
  CONVERT_VIDEO_LAMBDA: process.env.CONVERT_VIDEO_LAMBDA || "convertVideoToAudio",
};

module.exports = envConfig;
