const express = require("express");
const Summary = require("../models/Summary"); // Ensure you have a Summary model

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
        const { jobName, transcript, summary } = req.body;
        if (!jobName || !summary) {
            return res.status(400).json({ message: "Job name and summary are required" });
        }

        const newSummary = new Summary({ jobName, transcript, summary });
        await newSummary.save();

        res.status(201).json({ message: "Summary saved successfully", summary: newSummary });
    } catch (error) {
        console.error("❌ Error saving summary:", error);
        res.status(500).json({ message: "Failed to save summary" });
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
