const Summary = require('../models/Summary');

exports.getSummaries = async (req, res) => {
    try {
        const summaries = await Summary.find().populate('callId');
        res.json(summaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create summary
exports.createSummary = async (req, res) => {
    try {
        const { callId, summaryText, sentiment, keywords } = req.body;
        const newSummary = new Summary({ callId, summaryText, sentiment, keywords });
        await newSummary.save();
        res.status(201).json(newSummary);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
