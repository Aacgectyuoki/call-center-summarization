import React, { Component } from "react";
import FileUploader from "./components/FileUploader";
import axios from "axios";
import { checkTranscriptionStatus, summarizeText, getTranscriptionText } from "./api";
import { CloudWatchLogsClient, GetLogEventsCommand, DescribeLogStreamsCommand } from "@aws-sdk/client-cloudwatch-logs";
import "./App.css";
import { API_ROUTES } from "./config";
import { AWS_CLOUDWATCH_CONFIG } from "./awsCloudWatchConfig";

// Create a CloudWatchLogs client outside the component
const cloudWatchClient = new CloudWatchLogsClient({
  region: AWS_CLOUDWATCH_CONFIG.region,
  credentials: AWS_CLOUDWATCH_CONFIG.credentials,
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedType: null,
      file: null,
      error: "",
      jobName: "",
      status: "",
      summaryContent: [],
      technicalDefinitions: [],
      transcription: "",
      isSummarizing: false,
      progress: 0,
      summaryOptions: { length: "concise", complexity: "simplified", format: "bullet-pointed" },
      isCanceled: false,
    };
    this.progressInterval = null;
  }

  /** Handle file selection */
  handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validFormats = ["mp3", "mp4"];
    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();

    if (!validFormats.includes(fileExtension)) {
      this.setState({ error: "❌ Please select a valid MP3 or MP4 file." });
      return;
    }

    // Clear error if valid file is selected
    this.setState({ error: "", file: selectedFile });
    console.log("📂 File selected:", selectedFile.name);
  };

  /**
   * fetchLogStreamName:
   * Dynamically finds the CloudWatch log stream name using the current job ID.
   * Assumes jobName is "transcription-<jobID>" and log stream is "transcription-summary-<jobID>".
   */
  async fetchLogStreamName() {
    if (!this.state.jobName) return null;
    try {
      const command = new DescribeLogStreamsCommand({
        logGroupName: AWS_CLOUDWATCH_CONFIG.logGroupName,
        logStreamName: AWS_CLOUDWATCH_CONFIG.logStreamName,
        orderBy: "LastEventTime",
        descending: true,
        limit: 1,
      });
      const response = await cloudWatchClient.send(command);
      if (response.logStreams && response.logStreams.length > 0) {
        return response.logStreams[0].logStreamName;
      }
      return null;
    } catch (error) {
      console.error("❌ Error fetching log stream name:", error);
      return null;
    }
  }

  /**
   * fetchProgressFromCloudWatch:
   * Reads the latest log events from the dynamically found log stream and parses a "progress" value.
   */
  async fetchProgressFromCloudWatch() {
    try {
      const logStreamName = await this.fetchLogStreamName();
      if (!logStreamName) {
        console.error("No matching log stream found");
        return 0;
      }
      const command = new GetLogEventsCommand({
        logGroupName: AWS_CLOUDWATCH_CONFIG.logGroupName,
        logStreamName: logStreamName,
        limit: 5,
      });
      const response = await cloudWatchClient.send(command);
      let latestProgress = 0;
      for (const evt of response.events) {
        try {
          const parsed = JSON.parse(evt.message);
          if (parsed.progress) {
            const numeric = parseInt(parsed.progress.replace("%", ""), 10);
            if (!isNaN(numeric)) {
              latestProgress = numeric;
            }
          }
        } catch {
          // Ignore events that are not JSON
        }
      }
      return latestProgress;
    } catch (error) {
      console.error("❌ CloudWatch fetch error:", error);
      return 0;
    }
  }

  /**
   * parseBulletSummary:
   * Splits the summary into lines, detects bullet levels ("• " for level 1, "◦ " for level 2),
   * replaces **bold** markers with <strong> tags, and returns an array of indented React divs.
   */
  parseBulletSummary(text) {
    const lines = text.split(/\r?\n/);
    return lines.map((line, idx) => {
      let level = 0;
      let bulletChar = "";
      let processedLine = line;

      if (processedLine.startsWith("• ")) {
        level = 1;
        bulletChar = "•";
        processedLine = processedLine.slice(2).trim();
      } else if (processedLine.startsWith("◦ ")) {
        level = 2;
        bulletChar = "◦";
        processedLine = processedLine.slice(2).trim();
      }

      processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      const style = { marginLeft: `${level * 20}px` };

      return (
        <div key={idx} style={style} dangerouslySetInnerHTML={{ __html: bulletChar + " " + processedLine }} />
      );
    });
  }

  /** Upload File & Automatically Start Transcription */
  handleUpload = async (event) => {
    event.preventDefault();
    if (!this.state.file) {
      console.error("❌ No file selected");
      this.setState({ error: "❌ No file selected for upload." });
      return;
    }

    const formData = new FormData();
    formData.append("file", this.state.file);
    console.log("📡 Uploading file...");

    try {
      const response = await axios.post("http://localhost:5000/api/aws/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.transcriptionJobId) {
        this.setState({
          jobName: response.data.transcriptionJobId,
          status: "IN_PROGRESS",
        });
        console.log("✅ File uploaded and transcription started. Job Name:", response.data.transcriptionJobId);
      } else {
        console.warn("⚠️ Upload successful, but no transcription job id received.");
      }
    } catch (error) {
      console.error("❌ File Upload Error:", error);
      this.setState({ error: "⚠️ Failed to upload file. Please try again." });
    }
  };

  /** Check Transcription Status & Update Progress */
  handleCheckStatus = async () => {
    if (!this.state.jobName) {
      console.warn("⚠️ No transcription job found.");
      return;
    }
    console.log("📡 Checking transcription status for:", this.state.jobName);
    try {
      const response = await checkTranscriptionStatus(this.state.jobName);
      if (response.data?.status) {
        this.setState({ status: response.data.status });
        console.log("✅ Status updated:", response.data.status);

        if (response.data.progress !== undefined) {
          this.setState({ progress: response.data.progress });
        } else {
          // Optionally update progress using CloudWatch logs
          const cwProgress = await this.fetchProgressFromCloudWatch();
          this.setState({ progress: cwProgress });
        }
        if (response.data.status === "COMPLETED") {
          clearInterval(this.progressInterval);
          this.progressInterval = null;
          await this.handleFetchTranscription();
        }
      } else {
        console.warn("⚠️ No status found in response.");
      }
    } catch (err) {
      console.error("❌ Status Check Error:", err);
      this.setState({ error: "⚠️ Failed to check status. Please try again." });
    }
  };

  /** Fetch Transcription */
  handleFetchTranscription = async () => {
    if (!this.state.jobName) {
      console.warn("⚠️ No transcription job available.");
      return;
    }
    console.log("🔄 Fetching transcription for job:", this.state.jobName);
    try {
      const urlResponse = await axios.get(`${API_ROUTES.GET_S3_FILE_URL}?jobName=${this.state.jobName}`);
      if (urlResponse.data?.s3Url) {
        const s3Url = urlResponse.data.s3Url;
        console.log("✅ Retrieved S3 URL:", s3Url);
        
        const corsProxy = "https://thingproxy.freeboard.io/fetch/";
        const s3Response = await axios.get(corsProxy + s3Url);
        
        const transcriptText = s3Response.data.results?.transcripts[0]?.transcript || "";
        if (!transcriptText) {
          console.error("No transcription found in S3 file");
          return;
        }
        this.setState({ transcription: transcriptText });
        console.log("✅ Transcription stored:", transcriptText);
      } else {
        console.error("No S3 URL returned from backend");
      }
    } catch (error) {
      console.error("❌ Error fetching transcription:", error);
    }
  };

  /** Summarize Transcription */
  handleSummarize = async () => {
    if (!this.state.transcription) {
      console.warn("⚠️ No transcription found. Fetching first...");
      await this.handleFetchTranscription();
    }
    if (!this.state.transcription) {
      console.error("❌ Still no transcription available. Aborting summarization.");
      this.setState({ error: "⚠️ Cannot summarize. Transcription is missing." });
      return;
    }
    console.log("🔄 Starting Summarization...");
    this.setState({ isSummarizing: true, progress: 0, summaryContent: [], technicalDefinitions: [] });
    try {
      console.log("📡 Sending transcript to backend:", this.state.transcription);
      const { jobName, summaryOptions, transcription } = this.state;
      if (!jobName || !transcription.trim()) {
        throw new Error("Invalid request: No jobName or transcription text provided.");
      }
      const response = await summarizeText(jobName, summaryOptions.length, summaryOptions.complexity, summaryOptions.format);
      console.log("📡 API Response:", response.data);
      const summaryText = response.data.summary?.summary || response.data.summary.text;
      let technicalTerms = response.data.technicalTerms || [];
      if (!summaryText) {
        console.error("❌ Summary is missing in response:", response.data);
        throw new Error("Invalid summary format from backend");
      }
      const bulletElements = this.parseBulletSummary(summaryText);
      this.setState({
        summaryContent: bulletElements,
        technicalDefinitions: technicalTerms,
        isSummarizing: false,
        progress: 100,
      });
      console.log("✅ Summary & Technical Terms Generated!");
    } catch (error) {
      console.error("❌ Summarization Error:", error);
      this.setState({ isSummarizing: false, progress: 0, error: "⚠️ Failed to summarize. Please try again." });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.jobName && this.state.status === "IN_PROGRESS" && !this.progressInterval) {
      this.progressInterval = setInterval(this.handleCheckStatus, 5000);
    }
    if (prevState.status === "IN_PROGRESS" && this.state.status === "COMPLETED") {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    }
  }

  componentWillUnmount() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  render() {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800 p-8">
        <h1 className="text-3xl font-bold mb-4">DT Summarizr</h1>
        <p className="mb-6">Transform your content into concise, meaningful summaries</p>

        {/* Display error message if any */}
        {this.state.error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
            {this.state.error}
          </div>
        )}

        {/* Upload Section (shown only if no job is started) */}
        {!this.state.jobName && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Content</h2>
            <FileUploader setFile={(file) => this.setState({ file })} setError={(error) => this.setState({ error })} />
            <div className="flex space-x-4 mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={this.handleUpload} disabled={!this.state.file}>
                Upload &amp; Start Transcription
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar Section */}
        {this.state.jobName && this.state.status === "IN_PROGRESS" && (
          <div className="mb-6">
            <p className="mb-2">Progress: {this.state.progress}%</p>
            <div className="w-full bg-gray-300 rounded-full h-4">
              <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${this.state.progress}%` }}></div>
            </div>
          </div>
        )}

        {/* Transcription Display and Summarization Trigger */}
        {this.state.status === "COMPLETED" && this.state.transcription && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            {/* <h2 className="text-xl font-semibold mb-4">Transcription</h2> */}
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={this.handleSummarize}
              disabled={this.state.isSummarizing}
            >
              {this.state.isSummarizing ? "Summarizing..." : "Summarize Transcription"}
            </button>
          </div>
        )}

        {/* Summary Display */}
        {this.state.summaryContent.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="formatted-summary">{this.state.summaryContent}</div>
          </div>
        )}

        {/* Technical Terms Display */}
        {this.state.technicalDefinitions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Technical Terms</h2>
            <ul>
              {this.state.technicalDefinitions.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

export default App;
