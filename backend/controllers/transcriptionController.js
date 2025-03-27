const { getSignedUrlForFile } = require("../utils/awsS3Utils");
const axios = require("axios");
const { TranscribeClient, GetTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
const { generateSummary } = require("./summaryController"); // Use LangChain summarization
const { CloudWatchLogsClient, GetLogEventsCommand } = require("@aws-sdk/client-cloudwatch-logs");
const { cloudWatchClient } = require("../config/awsConfig");
const { saveTranscriptionJob } = require("../utils/transcriptionUtils");
const { trackEstimatedProgress } = require("../utils/progressTracker");
// const { setLogStreamName } = require("../utils/cloudWatchUtils");

const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION });

/**
 * transcribeAudio:
 * - Starts a transcription job by saving job info and returning a jobName.
 */
async function transcribeAudio(req, res) {
  try {
    const { audioUrl, fileId } = req.body;
    if (!audioUrl || !fileId) {
      return res.status(400).json({ message: "Audio URL and File ID are required" });
    }

    const jobName = `transcription-${Date.now()}`;

    // Save the transcription job
    await saveTranscriptionJob(jobName, fileId, audioUrl);

    // ✅ Set the log stream name BEFORE calling progress tracker
    // setLogStreamName(jobName);

    // Respond immediately
    res.status(200).json({
      message: "Transcription job started",
      jobName,
      fileId,
      s3Url: audioUrl,
    });

    // ⏳ Start progress tracking in the background
    const startTime = Date.now();
    const fileType = "mp3"; // Or parse from audioUrl
    // const audioDuration = (Date.now() - startTime) / 1000;
    const audioDuration = 60; // Replace with actual metadata if needed
    trackEstimatedProgress(jobName, startTime, fileType, audioDuration);

  } catch (error) {
    console.error("Transcription Error:", error);
    res.status(500).json({ message: "Failed to start transcription", error: error.message });
  }
}

/**
 * getTranscriptionText:
 * Retrieves the transcription text from the S3 bucket.
 */
async function getTranscriptionText(req, res) {
  const { jobName } = req.query;

  if (!jobName) {
    return res.status(400).json({ message: "Job name is required" });
  }

  try {
    console.log(`📡 Fetching transcription for job: ${jobName}`);

    const fileName = `transcriptions/${jobName}.json`; // Ensure the correct key format
    console.log(`🗂️ Using file path: ${fileName}`);

    const signedUrl = await getSignedUrlForFile(process.env.S3_BUCKET_NAME, fileName);
    console.log(`✅ Signed URL: ${signedUrl}`);

    const response = await axios.get(signedUrl);
    const transcriptText = response.data.results.transcripts[0].transcript || "";

    if (!transcriptText) {
      return res.status(400).json({ message: "No transcription found" });
    }

    res.status(200).json({ jobName, transcriptText });
  } catch (error) {
    console.error("❌ Error fetching transcription:", error);
    res.status(500).json({ message: "Failed to retrieve transcription", error: error.message });
  }
}

/**
 * summarizeTranscription:
 * Uses LangChain-based summarization to summarize a transcription.
 */
async function summarizeTranscription(req, res) {
  const { jobName, length = "regular", complexity = "regular", format = "regular" } = req.body;

  if (!jobName) {
    return res.status(400).json({ message: "Job name is required" });
  }

  try {
    // Use LangChain-based summarization
    const summary = await generateSummary({ jobName, length, complexity, format });

    res.status(200).json({
      jobName,
      summary,
    });
  } catch (error) {
    console.error("Error summarizing transcription:", error);
    res.status(500).json({ message: "Failed to summarize transcription", error: error.message });
  }
}

/**
 * getProgressFromCloudWatch:
 * Reads the last few log events from the log stream and returns the most recent "progress" value.
 * Assumes jobName is in the format "transcription-<jobID>" and that the log stream is named
 * "transcription-summary-<jobID>".
 */
async function getProgressFromCloudWatch(jobName) {
  try {
    // Convert "transcription-<jobID>" to "transcription-summary-<jobID>"
    const jobID = jobName.replace("transcription-", "");
    const logStreamName = `transcription-summary-${jobID}`;

    const command = new GetLogEventsCommand({
      logGroupName: process.env.AWS_CLOUDWATCH_LOG_GROUP, // e.g. "CallCenterSummarizationLogs"
      logStreamName,
      limit: 5, // Grab the last few events
    });

    const response = await cloudWatchClient.send(command);
    let latestProgress = 0;

    // Loop through events to find the newest "progress" field
    for (const evt of response.events) {
      try {
        // Expect log event message as JSON with a "progress" key, e.g.:
        // { "status": "PROGRESS", "message": "Estimated transcription progress: 42%", "jobName": "transcription-...", "progress": "42%" }
        const parsed = JSON.parse(evt.message);
        if (parsed.progress) {
          const numeric = parseInt(parsed.progress.replace("%", ""), 10);
          if (!isNaN(numeric)) {
            latestProgress = numeric;
          }
        }
      } catch {
        // Ignore if evt.message is not JSON
      }
    }
    return latestProgress;
  } catch (error) {
    console.error("❌ CloudWatch fetch error:", error);
    return 0; // Fallback
  }
}

/**
 * checkTranscriptionStatus:
 * Checks the transcription job status via AWS Transcribe and includes progress from CloudWatch.
 */
async function checkTranscriptionStatus(req, res) {
  const { jobName } = req.query;

  if (!jobName) {
    return res.status(400).json({ message: "Missing jobName parameter" });
  }

  try {
    const command = new GetTranscriptionJobCommand({ TranscriptionJobName: jobName });
    const response = await transcribeClient.send(command);

    if (!response.TranscriptionJob) {
      return res.status(404).json({ message: "Transcription job not found" });
    }

    const jobStatus = response.TranscriptionJob.TranscriptionJobStatus;

    let progress = 0;
    if (jobStatus === "IN_PROGRESS") {
      progress = await getProgressFromCloudWatch(jobName);
    } else if (jobStatus === "COMPLETED") {
      progress = 100;
    }

    return res.status(200).json({
      jobName,
      status: jobStatus,
      transcriptUrl: response.TranscriptionJob.Transcript?.TranscriptFileUri || null,
      progress,
    });
  } catch (error) {
    console.error("❌ Error checking transcription status:", error);
    res.status(500).json({ message: "Failed to check transcription status" });
  }
}

module.exports = {
  transcribeAudio,
  getTranscriptionText,
  summarizeTranscription,
  checkTranscriptionStatus,
  getProgressFromCloudWatch,
};
