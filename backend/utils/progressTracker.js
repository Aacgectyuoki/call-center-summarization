const { logToCloudWatch } = require("./cloudWatchUtils");
const { predictTranscriptionTime } = require("./predictionUtils");
const { getTranscriptionJobStatus } = require("./awsTranscribeUtils");

const trackEstimatedProgress = async (jobName, startTime, fileType, audioDuration) => {
    const jobID = jobName.replace("transcription-", "");
    const logStreamName = `transcription-summary-${jobID}`;
  
    let predictedTime = await predictTranscriptionTime(fileType, audioDuration);
    if (!predictedTime || isNaN(predictedTime)) {
      predictedTime = Math.max(audioDuration * 0.1, 5);
    }
  
    let progressPercent = 0;
  
    while (progressPercent < 100) {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const jobStatus = await getTranscriptionJobStatus(jobName);
      if (jobStatus === "COMPLETED") {
        console.log(`✅ Transcription job ${jobName} is complete. Stopping progress tracking.`);
        return;
      }
  
      progressPercent = Math.min(Math.round((elapsedTime / predictedTime) * 100), 99);
      if (isNaN(progressPercent)) return;
  
      console.log(`⏳ Estimated progress: ${progressPercent}%`);
      await logToCloudWatch(
        {
          status: "PROGRESS",
          message: `Estimated transcription progress: ${progressPercent}%`,
          jobName,
          progress: `${progressPercent}%`,
        },
        logStreamName
      );
  
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  };

module.exports = { trackEstimatedProgress };