const { logToCloudWatch } = require("../utils/cloudWatchUtils");
const { predictTranscriptionTime } = require("../utils/predictionUtils");
const { getTranscriptionJobStatus } = require("../utils/awsTranscribeUtils");

const trackEstimatedProgress = async (jobName, startTime, fileType, audioDuration) => {
    let predictedTime = await predictTranscriptionTime(fileType, audioDuration);

    if (!predictedTime || isNaN(predictedTime)) {
        console.warn(`⚠️ Warning: Predicted transcription time is invalid (${predictedTime}). Using fallback.`);
        predictedTime = Math.max(audioDuration * 0.1, 5); // Use fallback
    }

    let progressPercent = 0;

    while (progressPercent < 100) {
        const elapsedTime = (Date.now() - startTime) / 1000;

        // Check if transcription is complete
        const jobStatus = await getTranscriptionJobStatus(jobName);
        if (jobStatus === "COMPLETED") {
            console.log(`✅ Transcription job ${jobName} is complete. Stopping progress tracking.`);
            return; // Exit function immediately
        }

        progressPercent = Math.min(Math.round((elapsedTime / predictedTime) * 100), 99);

        if (isNaN(progressPercent)) {
            console.error("❌ Error: Progress percent calculated as NaN. Stopping.");
            return;
        }

        console.log(`⏳ Estimated progress: ${progressPercent}%`);
        await logToCloudWatch({
            status: "PROGRESS",
            message: `Estimated transcription progress: ${progressPercent}%`,
            jobName,
            progress: `${progressPercent}%`,
        });

        await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
    }
};

module.exports = { trackEstimatedProgress };