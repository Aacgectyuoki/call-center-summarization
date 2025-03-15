const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
require("dotenv").config();
const envConfig = require("../config/envConfig");

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("AWS configuration environment variables are not set");
}

const lambdaClient = new LambdaClient({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
});

const invokeLambda = async (functionName, payload) => {
    const params = {
        FunctionName: functionName,
        Payload: JSON.stringify(payload)
    };

    try {
        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);
        return JSON.parse(Buffer.from(response.Payload).toString());
    } catch (error) {
        console.error("Error invoking Lambda:", error);
        throw new Error("Lambda invocation failed");
    }
};

// Define and export the triggerLambdaTranscription function
// const triggerLambdaTranscription = async (audioUrl) => {
//     const functionName = "transcribeAudioFunction"; // Replace with your actual Lambda function name
//     const payload = { audioUrl }; // Adjust the payload as needed
//     return await invokeLambda(functionName, payload);
// };

// Use environment variables instead of hardcoded function names
const triggerLambdaTranscription = async (audioUrl) => {
    return await invokeLambda(envConfig.TRANSCRIBE_LAMBDA, { audioUrl });
};

const generateSummaryWithLambda = async (transcriptionText) => {
    return await invokeLambda(envConfig.SUMMARY_LAMBDA, { transcriptionText });
};

module.exports = { invokeLambda, triggerLambdaTranscription, generateSummaryWithLambda };