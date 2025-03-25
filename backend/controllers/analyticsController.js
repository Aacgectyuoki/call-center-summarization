const Sentiment = require("sentiment");
const Transcription = require("../models/Transcription");
const Summary = require("../models/Summary");

exports.analyzeSentiment = async (req, res) => {
    try {
        const { transcriptionId } = req.params;
        const transcription = await Transcription.findById(transcriptionId);

        if (!transcription) {
            return res.status(404).json({ message: "Transcription not found" });
        }

        const sentiment = new Sentiment();
        const result = sentiment.analyze(transcription.transcription);

        res.status(200).json({
            message: "Sentiment analysis completed",
            score: result.score,
            comparative: result.comparative,
            tokens: result.tokens,
            words: result.words,
            positive: result.positive,
            negative: result.negative,
        });

    } catch (error) {
        console.error("❌ Error analyzing sentiment:", error);
        res.status(500).json({ message: "Error analyzing sentiment", error });
    }
};

exports.getProcessingTimes = async (req, res) => {
    try {
        const transcriptions = await Transcription.find();
        const summaries = await Summary.find();

        // Avoid division by zero
        const transcriptionCount = transcriptions.length || 1;
        const summaryCount = summaries.length || 1;

        const processingTimes = {
            totalTranscriptions: transcriptions.length,
            totalSummaries: summaries.length,
            avgTranscriptionTime: transcriptions.reduce((sum, t) => sum + (t.processingTime || 0), 0) / transcriptionCount,
            avgSummaryTime: summaries.reduce((sum, s) => sum + (s.processingTime || 0), 0) / summaryCount,
        };

        res.status(200).json({ message: "Processing times retrieved", processingTimes });

    } catch (error) {
        console.error("❌ Error fetching processing times:", error);
        res.status(500).json({ message: "Error fetching processing times", error });
    }
};

exports.processAnalytics = async (req, res) => {
    try {
        const { transcriptionId } = req.params;
        const transcription = await Transcription.findById(transcriptionId);

        if (!transcription) {
            return res.status(404).json({ error: "Transcription not found" });
        }

        const processingTime = transcription.processingTime || "Unknown";

        res.status(200).json({ 
            transcription: transcription.transcription,
            processingTime 
        });
    } catch (error) {
        console.error("❌ Error fetching analytics:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
