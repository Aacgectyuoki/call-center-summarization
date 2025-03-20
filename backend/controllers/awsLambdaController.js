const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const { exec } = require("child_process");
const { uploadFileToS3 } = require("../utils/awsS3Utils");
const { invokeLambda } = require("../utils/awsLambdaUtils");
const envConfig = require("../config/envConfig");

// Initialize AWS Lambda Client (SDK v3)
const lambdaClient = new LambdaClient({ region: "us-east-1" });

/**
 * Convert MP4 to Audio (Calls AWS Lambda)
 */
const processMP4Upload = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: "No file uploaded" });

        const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.filename}`;

        // Invoke Convert Video Lambda
        const lambdaParams = {
            FunctionName: envConfig.CONVERT_VIDEO_LAMBDA,
            Payload: JSON.stringify({ s3Url }),
        };

        const lambdaResponse = await lambdaClient.send(new InvokeCommand(lambdaParams));
        const responsePayload = JSON.parse(Buffer.from(lambdaResponse.Payload).toString("utf-8"));

        if (!responsePayload.audioUrl) throw new Error("Lambda did not return audio URL");

        res.json({
            message: "MP4 processed & uploaded",
            audioUrl: responsePayload.audioUrl,
        });
    } catch (error) {
        console.error("❌ MP4 Processing Error:", error);
        res.status(500).json({ error: "Failed to process MP4" });
    }
};


/**
 * Transcribe Audio using AWS Lambda
 */
const processAudioLambda = async (req, res) => {
    try {
        const { audioUrl } = req.body;
        if (!audioUrl) {
            return res.status(400).json({ error: "Audio file URL is required" });
        }

        // Invoke Transcribe Lambda
        const lambdaParams = {
            FunctionName: envConfig.TRANSCRIBE_LAMBDA,
            Payload: JSON.stringify({ audioUrl }),
        };

        const lambdaResponse = await lambdaClient.send(new InvokeCommand(lambdaParams));
        const responsePayload = JSON.parse(Buffer.from(lambdaResponse.Payload).toString("utf-8"));

        res.json(responsePayload);
    } catch (error) {
        console.error("❌ Error processing audio with Lambda:", error);
        res.status(500).json({ error: "Failed to process audio with Lambda" });
    }
};

module.exports = { processMP4Upload, processAudioLambda };