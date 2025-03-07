const Call = require('../models/Call');
const Transcription = require('../models/Transcription');
const Summary = require('../models/Summary');

// Get all calls
exports.getCalls = async (req, res) => {
    try {
        const calls = await Call.find().populate('transcription summary');
        res.json(calls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new call record
exports.createCall = async (req, res) => {
    try {
        const { agentId, audioFile } = req.body;
        const newCall = new Call({ agentId, audioFile });
        await newCall.save();
        res.status(201).json(newCall);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
