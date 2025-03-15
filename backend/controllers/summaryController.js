const { summarizeText } = require("../utils/openaiUtils");
const axios = require("axios");

const generateSummary = async (req, res) => {
    try {
        const { jobName, length = "regular", complexity = "regular", format = "regular" } = req.body;
        if (!jobName) {
            return res.status(400).json({ error: "Missing jobName parameter" });
        }

        // Construct S3 URL
        const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${jobName}.json`;

        // Fetch transcription JSON from S3
        const response = await axios.get(s3Url);
        const transcriptionData = response.data;

        // Extract transcript text
        if (!transcriptionData.results || !transcriptionData.results.transcripts) {
            return res.status(400).json({ error: "Invalid transcription format" });
        }
        const fullText = transcriptionData.results.transcripts.map(t => t.transcript).join(" ");

        // Call AI summarization function with user preferences
        const summary = await summarizeText(fullText, length, complexity, format);

        res.json({ summary });

    } catch (error) {
        console.error("Summarization Error:", error);
        res.status(500).json({ error: "Failed to summarize transcription" });
    }
};

module.exports = { generateSummary };
