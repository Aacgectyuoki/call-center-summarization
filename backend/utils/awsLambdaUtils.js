const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });

const lambda = new AWS.Lambda();

const invokeLambda = async (functionName, payload) => {
    const params = {
        FunctionName: functionName,
        Payload: JSON.stringify(payload)
    };

    try {
        const response = await lambda.invoke(params).promise();
        return JSON.parse(response.Payload);
    } catch (error) {
        throw new Error("Error invoking Lambda function: " + error.message);
    }
};

const triggerLambdaTranscription = async (payload) => {
    const functionName = "yourLambdaFunctionName"; // Replace with your actual Lambda function name
    return await invokeLambda(functionName, payload);
};

module.exports = {
    invokeLambda,
    triggerLambdaTranscription
};


// const AWS = require("aws-sdk");
// const lambda = new AWS.Lambda();

// const invokeLambdaFunction = async (functionName, payload) => {
//   try {
//     const params = {
//       FunctionName: functionName,
//       Payload: JSON.stringify(payload),
//     };
//     const response = await lambda.invoke(params).promise();
//     return JSON.parse(response.Payload);
//   } catch (error) {
//     throw new Error(`Lambda invocation failed: ${error.message}`);
//   }
// };

// module.exports = { invokeLambdaFunction };