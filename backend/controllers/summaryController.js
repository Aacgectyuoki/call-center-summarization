const { fetchS3File } = require("../utils/awsS3Utils");
const { generateStructuredSummary } = require("../utils/summarizer");

const generateSummary = async (req, res) => {
    try {
        const { jobName } = req.body;

        if (!jobName) {
            return res.status(400).json({ error: "Job name is required" });
        }

        // Fetch transcription from S3
        const key = `${jobName}.json`;
        const transcript = await fetchS3File(process.env.S3_BUCKET_NAME, key); // ✅ Now fetchS3File is defined

        if (!transcript || transcript.trim() === "") {
            return res.status(400).json({ error: "Empty or invalid transcription data" });
        }

        // Call summarization logic
        const structuredSummary = await generateStructuredSummary(transcript);

        res.status(200).json({ summary: structuredSummary });
    } catch (error) {
        console.error("❌ Summarization Error:", error);
        res.status(500).json({ error: "Failed to generate summary" });
    }
};

module.exports = { generateSummary };
