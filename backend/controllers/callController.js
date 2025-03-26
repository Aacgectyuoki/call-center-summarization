const Call = require("../models/Call");
const { authenticateUser } = require("../middleware/authMiddleware");

// Fetch all calls (Authenticated Users Only)
exports.getCalls = async (req, res) => {
    try {
        const calls = await Call.find({ user: req.user.id }); // Fetch user's calls only
        res.status(200).json(calls);
    } catch (error) {
        console.error("Error fetching calls:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create a new call (Authenticated Users Only)
exports.createCall = async (req, res) => {
    try {
        const { agentId, audioFile } = req.body;

        const newCall = new Call({
            agentId,
            user: req.user.id, // Attach user to call
            audioFile,
        });

        await newCall.save();
        res.status(201).json({ message: "Call created successfully", call: newCall });
    } catch (error) {
        console.error("Error creating call:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

