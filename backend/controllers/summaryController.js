const Summary = require("../models/Summary");
const Transcription = require("../models/Transcription");
const { summarizeText } = require("../utils/summaryUtils");

/**
 * Generates a summary for an existing transcription.
 */
const summarizeTranscription = async (req, res) => {
    try {
        const { transcriptionId } = req.body;

        // Check if the transcription exists
        const transcription = await Transcription.findById(transcriptionId);
        if (!transcription) {
            return res.status(404).json({ error: "Transcription not found." });
        }

        // Generate summary using OpenAI GPT
        const summaryResult = await summarizeText(transcription.transcription);

        if (!summaryResult || summaryResult.status === "failed") {
            return res.status(500).json({ error: "Summarization failed.", details: summaryResult.error });
        }

        // Save the summary in MongoDB
        const newSummary = new Summary({
            transcription: transcriptionId,
            summaryText: summaryResult.summary,
            bulletPoints: summaryResult.bulletPoints || [],
            sentiment: summaryResult.sentiment || "neutral",
            status: "completed"
        });

        await newSummary.save();

        return res.status(201).json({
            message: "Summarization completed successfully.",
            summary: newSummary
        });

    } catch (error) {
        console.error("Error generating summary:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

/**
 * Retrieves all summaries from the database.
 */
const getSummaries = async (req, res) => {
    try {
        const summaries = await Summary.find().populate("transcription").sort({ createdAt: -1 });
        return res.status(200).json(summaries);
    } catch (error) {
        console.error("Error fetching summaries:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

/**
 * Retrieves a single summary by ID.
 */
const getSummaryById = async (req, res) => {
    try {
        const summary = await Summary.findById(req.params.id).populate("transcription");
        if (!summary) {
            return res.status(404).json({ error: "Summary not found." });
        }
        return res.status(200).json(summary);
    } catch (error) {
        console.error("Error fetching summary:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = {
    summarizeTranscription,
    getSummaries,
    getSummaryById
};
