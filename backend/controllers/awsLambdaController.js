const { invokeLambda } = require("../utils/awsLambdaUtils");

exports.processAudioLambda = async (req, res) => {
    try {
        const { audioFile } = req.body;

        if (!audioFile) {
            return res.status(400).json({ message: "Audio file path is required" });
        }

        // Call Lambda function
        const response = await invokeLambda("your-lambda-function-name", { audioFile });

        res.status(200).json({ message: "Lambda triggered", response });
    } catch (error) {
        res.status(500).json({ message: "Error processing audio with Lambda", error });
    }
};
