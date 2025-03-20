const { TranscribeClient, StartTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION });

const startTranscriptionJob = async (s3Url) => {
    const jobName = `transcription-${Date.now()}`;
    const params = {
        TranscriptionJobName: jobName,
        LanguageCode: process.env.AWS_TRANSCRIBE_LANGUAGE || "en-US",
        MediaFormat: "mp3",
        Media: { MediaFileUri: s3Url },
        OutputBucketName: process.env.S3_BUCKET_NAME,
    };

    try {
        await transcribeClient.send(new StartTranscriptionJobCommand(params));
        console.log("✅ Transcription job started:", jobName);
        return jobName;
    } catch (error) {
        console.error("❌ Transcription Error:", error);
        throw new Error("Failed to start transcription job");
    }
};

module.exports = { startTranscriptionJob };
