const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const envConfig = require("../config/envConfig");

const lambdaClient = new LambdaClient({ region: envConfig.AWS_REGION });

const invokeLambda = async (functionName, payload) => {
    try {
        const params = {
            FunctionName: functionName,
            Payload: JSON.stringify(payload),
        };

        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);

        return JSON.parse(Buffer.from(response.Payload).toString("utf-8"));
    } catch (error) {
        console.error("❌ Lambda Invocation Error:", error);
        throw new Error("Lambda invocation failed");
    }
};

module.exports = { invokeLambda };
