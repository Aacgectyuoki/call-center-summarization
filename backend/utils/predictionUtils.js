const { getTranscriptionHistoryCollection } = require("../models/TranscriptionHistory");

const predictTranscriptionTime = async (fileType, audioDuration) => {
    try {
        const historyCollection = getTranscriptionHistoryCollection();
        const history = await historyCollection.find({ fileType }).toArray();

        if (!history || history.length === 0) {
            console.warn(`⚠️ No transcription history found for fileType: ${fileType}. Using default estimate.`);
            return Math.max(audioDuration * 0.1, 5); // Default to 10% of audioDuration, minimum 5 seconds
        }

        // 🔹 Find the closest match
        let closestMatch = history.reduce((prev, curr) =>
            Math.abs(curr.audioDuration - audioDuration) < Math.abs(prev.audioDuration - audioDuration) ? curr : prev
        );

        const predictedTime = closestMatch.transcriptionTime || Math.max(audioDuration * 0.1, 5);
        console.log(`🔹 Predicted Transcription Time: ${predictedTime} seconds`);

        return predictedTime;
    } catch (error) {
        console.error("❌ Error predicting transcription time:", error);
        return Math.max(audioDuration * 0.1, 5); // Fallback
    }
};

module.exports = { predictTranscriptionTime };
