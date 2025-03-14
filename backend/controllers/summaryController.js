const { summarizeText } = require("../utils/openaiUtils");

const generateSummary = async (req, res) => {
    try {
        const { transcription, length, complexity, format } = req.body;
        if (!transcription) return res.status(400).json({ error: "No transcription provided" });

        const summary = await summarizeText(transcription, length, complexity, format);
        res.json({ summary });
    } catch (error) {
        console.error("Summarization error:", error);
        res.status(500).json({ error: "Failed to generate summary" });
    }
};

module.exports = { generateSummary };
