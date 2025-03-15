const AWS = require("aws-sdk");
const { exec } = require("child_process");
const { uploadFileToS3 } = require("../utils/awsS3Utils");
const { triggerLambdaTranscription } = require("../utils/awsLambdaUtils");
const { invokeLambda } = require("../utils/awsLambdaUtils");
const envConfig = require("../config/envConfig");

AWS.config.update({ region: "us-east-1" });

const processMP4Upload = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: "No file uploaded" });

        const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.filename}`;

        // Invoke Convert Video Lambda
        const videoToAudioResponse = await invokeLambda(envConfig.CONVERT_VIDEO_LAMBDA, { s3Url });
        
        res.json({
            message: "MP4 processed & uploaded",
            audioUrl: videoToAudioResponse.audioUrl
        });
    } catch (error) {
        console.error("❌ MP4 Processing Error:", error);
        res.status(500).json({ error: "Failed to process MP4" });
    }
};

const processAudioLambda = async (req, res) => {
    try {
        const { audioUrl } = req.body;
        if (!audioUrl) {
            return res.status(400).json({ error: "Audio file URL is required" });
        }

        const response = await invokeLambda(envConfig.TRANSCRIBE_LAMBDA, { audioUrl });
        res.json(response);
    } catch (error) {
        console.error("❌ Error processing audio with Lambda:", error);
        res.status(500).json({ error: "Failed to process audio with Lambda" });
    }
};

module.exports = { processMP4Upload, processAudioLambda }
