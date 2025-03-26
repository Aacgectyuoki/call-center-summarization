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
        const transcriptData = await fetchS3File(process.env.S3_BUCKET_NAME, key);

        console.log("Fetched transcript data type:", typeof transcriptData); // Log the type of fetched data
        console.log("Fetched transcript data:", transcriptData); // Log the fetched data

        if (!transcriptData || typeof transcriptData !== 'object') {
            return res.status(400).json({ error: "Invalid transcription data" });
        }

        // Extract the transcription text
        const transcriptsArray = transcriptData.results?.transcripts;
        if (!transcriptsArray || transcriptsArray.length === 0) {
            return res.status(400).json({ error: "No transcription text found" });
        }

        const transcript = transcriptsArray[0]?.transcript?.trim();
        if (!transcript) {
            return res.status(400).json({ error: "Empty transcription data" });
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
