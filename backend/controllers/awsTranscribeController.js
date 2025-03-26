const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION });
const { trackEstimatedProgress } = require("../utils/progressTracker"); 

const startTranscriptionJob = async (s3Url, localFilePath, fileType, audioDuration) => {
    try {
        const jobName = `transcription-${Date.now()}`;
        console.log(`🚀 Starting transcription job: ${jobName}`);

        const params = {
            TranscriptionJobName: jobName,
            LanguageCode: "en-US",
            MediaFormat: "mp3",
            Media: { MediaFileUri: s3Url },
            OutputBucketName: process.env.S3_BUCKET_NAME
        };

        const command = new StartTranscriptionJobCommand(params);
        await transcribeClient.send(command);
        console.log(`✅ Transcription job started: ${jobName}`);

        // Start tracking progress in parallel
        trackEstimatedProgress(jobName, Date.now(), fileType, audioDuration);

        return jobName;
    } catch (error) {
        console.error("❌ Transcription Error:", error);
        throw new Error("Failed to start transcription job");
    }
};

const getTranscriptionJobStatus = async (jobName) => {
    try {
        console.log(`🔎 Checking status for transcription job: ${jobName}`);

        const command = new GetTranscriptionJobCommand({ TranscriptionJobName: jobName });
        const response = await transcribeClient.send(command);

        if (!response || !response.TranscriptionJob) {
            console.error(`❌ No response or invalid data received for job: ${jobName}`);
            return "FAILED";
        }

        const jobStatus = response.TranscriptionJob.TranscriptionJobStatus;
        console.log(`📌 Job Status for ${jobName}: ${jobStatus}`);

        return jobStatus;
    } catch (error) {
        console.error(`❌ Error fetching transcription job status for ${jobName}:`, error);
        return "FAILED";
    }
};

module.exports = { startTranscriptionJob, getTranscriptionJobStatus };
