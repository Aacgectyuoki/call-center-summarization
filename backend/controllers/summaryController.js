const Summary = require("../models/Summary");

exports.generateSummary = async (req, res) => {
    try {
        const { transcriptionId, summaryText } = req.body;
        const summary = new Summary({ transcriptionId, summaryText });

        await summary.save();
        res.status(201).json({ message: "Summary created successfully", summary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
