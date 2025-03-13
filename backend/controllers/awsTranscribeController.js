const { startTranscription } = require("../utils/awsTranscribeUtils");

exports.transcribeAudio = async (req, res) => {
    try {
        const { s3Uri, jobName } = req.body;

        if (!s3Uri || !jobName) {
            return res.status(400).json({ message: "S3 URI and Job Name are required" });
        }

        const response = await startTranscription(s3Uri, jobName);

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: "Error transcribing audio", error });
    }
};


// const AWS = require("aws-sdk");
// const Transcription = require("../models/Transcription");

// const transcribe = new AWS.TranscribeService();

// exports.startTranscription = async (req, res) => {
//   try {
//     const { audioFile } = req.body;

//     const params = {
//       TranscriptionJobName: `Transcription-${Date.now()}`,
//       LanguageCode: "en-US",
//       Media: { MediaFileUri: audioFile },
//       OutputBucketName: process.env.S3_BUCKET_NAME,
//     };

//     await transcribe.startTranscriptionJob(params).promise();
//     res.status(200).json({ message: "Transcription started" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };