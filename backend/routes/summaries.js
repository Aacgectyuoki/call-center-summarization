const express = require("express");
const Summary = require("../models/Summary"); // Ensure you have a Summary model
const { generateStructuredSummary } = require("../utils/summarizer");
const { getTranscriptByJobName } = require("../utils/transcriptionUtils");

const router = express.Router();

/**
 * 📄 **GET /api/summaries**
 * - Fetch the latest 10 summaries from the database
 */
router.get("/", async (req, res) => {
    try {
        const summaries = await Summary.find().sort({ createdAt: -1 }).limit(10);
        res.status(200).json(summaries);
    } catch (error) {
        console.error("❌ Error fetching summaries:", error);
        res.status(500).json({ message: "Failed to retrieve summaries" });
    }
});

/**
 * ➕ **POST /api/summaries**
 * - Save a new summary
 */
router.post("/", async (req, res) => {
    try {
        const { jobName, length, complexity, format } = req.body;

        if (!jobName || !length || !complexity || !format) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        console.log("🟢 Summarizing transcript for job:", jobName);

        // Retrieve transcription text (mock or real)
        const transcript = await getTranscriptByJobName(jobName);
        if (!transcript) {
            return res.status(404).json({ message: "Transcript not found" });
        }

        const summary = await generateStructuredSummary(transcript);

        // Ensure summary is a string before sending it to frontend
        const extractedSummary = summary?.text || summary;
        if (typeof extractedSummary !== "string") {
            console.error("❌ Backend returned invalid summary format:", extractedSummary);
            return res.status(500).json({ message: "Invalid summary format from AI" });
        }

        res.status(200).json({
            summary: summary.text, // Ensure correct format
            technicalTerms: summary.technicalTerms || []
        });        

    } catch (error) {
        console.error("❌ Summarization Error:", error);
        res.status(500).json({ message: "Summarization failed" });
    }
});

/**
 * 🔍 **GET /api/summaries/:jobName**
 * - Fetch a specific summary by jobName
 */
router.get("/:jobName", async (req, res) => {
    try {
        const { jobName } = req.params;
        const summary = await Summary.findOne({ jobName });

        if (!summary) {
            return res.status(404).json({ message: "Summary not found" });
        }

        res.status(200).json(summary);
    } catch (error) {
        console.error("❌ Error fetching summary:", error);
        res.status(500).json({ message: "Failed to retrieve summary" });
    }
});

/**
 * ❌ **DELETE /api/summaries/:jobName**
 * - Delete a summary by jobName
 */
router.delete("/:jobName", async (req, res) => {
    try {
        const { jobName } = req.params;
        const deletedSummary = await Summary.findOneAndDelete({ jobName });

        if (!deletedSummary) {
            return res.status(404).json({ message: "Summary not found" });
        }

        res.status(200).json({ message: "Summary deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting summary:", error);
        res.status(500).json({ message: "Failed to delete summary" });
    }
});

module.exports = router;
