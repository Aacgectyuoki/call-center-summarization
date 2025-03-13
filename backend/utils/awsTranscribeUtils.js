const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });

const transcribeService = new AWS.TranscribeService();

exports.startTranscription = async (s3Uri, jobName) => {
    const params = {
        TranscriptionJobName: jobName,
        LanguageCode: "en-US", // Change if needed
        MediaFormat: "mp3", // Change if needed
        Media: { MediaFileUri: s3Uri },
        OutputBucketName: "your-s3-bucket-name" // Replace with actual S3 bucket name
    };

    try {
        await transcribeService.startTranscriptionJob(params).promise();
        return { message: "Transcription job started", jobName };
    } catch (error) {
        throw new Error("Error starting transcription: " + error.message);
    }
};
