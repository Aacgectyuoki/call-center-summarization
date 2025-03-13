const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" }); // Update with your AWS region

const sagemaker = new AWS.SageMakerRuntime();

exports.generateSummary = async (text) => {
    const params = {
        EndpointName: "your-sagemaker-endpoint-name", // Replace with actual SageMaker endpoint
        Body: JSON.stringify({ text }),
        ContentType: "application/json"
    };

    try {
        const response = await sagemaker.invokeEndpoint(params).promise();
        const result = JSON.parse(response.Body.toString("utf-8"));
        return result.summary; // Assuming SageMaker returns a "summary" field
    } catch (error) {
        throw new Error("Error generating summary with SageMaker: " + error.message);
    }
};
