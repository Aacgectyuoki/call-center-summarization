const express = require('express');
const router = express.Router();
const Transcription = require('../models/Transcription');
const { processTranscription } = require('../utils/transcribeUtils');

router.post('/webhook/transcribe', async (req, res) => {
    try {
        const { jobName, status, results } = req.body;

        if (status !== 'COMPLETED') {
            return res.status(400).json({ message: "Job not completed" });
        }

        const transcriptionText = results.transcripts[0].transcript;
        await Transcription.findOneAndUpdate(
            { jobName },
            { text: transcriptionText, status: 'COMPLETED' }
        );

        res.status(200).json({ message: "Transcription updated" });
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
