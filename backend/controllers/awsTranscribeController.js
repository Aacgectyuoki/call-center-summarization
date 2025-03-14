const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });
const transcribe = new AWS.TranscribeService();

const startTranscriptionJob = async (s3Url) => {
    const jobName = `transcription-${Date.now()}`;
    const params = {
        TranscriptionJobName: jobName,
        LanguageCode: "en-US",
        MediaFormat: "mp3",
        Media: { MediaFileUri: s3Url },
        OutputBucketName: process.env.S3_BUCKET_NAME,
    };

    try {
        await transcribe.startTranscriptionJob(params).promise();
        console.log("Started transcription job:", jobName);
        return jobName;
    } catch (error) {
        console.error("Transcription error:", error);
        throw new Error("Failed to start transcription job");
    }
};

module.exports = { startTranscriptionJob };
