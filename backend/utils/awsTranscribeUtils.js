const { TranscribeClient, StartTranscriptionJobCommand, LanguageCode, MediaFormat } = require("@aws-sdk/client-transcribe");
require("dotenv").config();

const region = process.env.AWS_REGION;
const bucketName = process.env.S3_BUCKET_NAME;

if (!region || !bucketName) {
    throw new Error("AWS configuration environment variables are not set");
}

const transcribeClient = new TranscribeClient({ region });

const startTranscription = async (audioUrl, jobName) => {
    const params = {
        TranscriptionJobName: jobName,
        LanguageCode: LanguageCode.EN_US, // Use the LanguageCode enum
        MediaFormat: MediaFormat.MP3, // Use the MediaFormat enum
        Media: {
            MediaFileUri: audioUrl, // S3 URL of uploaded audio
        },
        OutputBucketName: bucketName, // Store transcript in the same bucket
    };

    try {
        const command = new StartTranscriptionJobCommand(params);
        await transcribeClient.send(command);
        return { message: "Transcription started successfully", jobName };
    } catch (error) {
        console.error("Error starting transcription:", error);
        throw new Error("Failed to start transcription");
    }
};

module.exports = { startTranscription };