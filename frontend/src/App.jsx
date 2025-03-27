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
    // Split text by newlines and remove any empty lines
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
    
    // Map each line to a React element while logging its metadata
    const bulletElements = lines.map((line, idx) => {
      const trimmed = line.trim();
      
      // Log metadata for inspection
      console.log(`[Line ${idx}]`, {
        raw: trimmed,
        level: trimmed.startsWith("• ") ? 1 : trimmed.startsWith("◦ ") ? 2 : 0,
        isHeader: /^\*\*.+\*\*$/.test(trimmed),
        isDefinition: trimmed.startsWith("• **") && trimmed.includes(":"),
        boldedSegments: (trimmed.match(/\*\*(.*?)\*\*/g) || []).map(s => s.replace(/\*\*/g, "")),
        hasColon: trimmed.includes(":"),
      });
      
      // If the line is a section header (wrapped in **)
      if (/^\*\*.+\*\*$/.test(trimmed)) {
        return (
          <div
            key={idx}
            className="summary-header"
            style={{ fontWeight: "bold", marginTop: "1.5rem", paddingLeft: 0 }}
          >
            {trimmed.replace(/\*\*/g, "")}
          </div>
        );
      }
      
      // If the line is a definition (e.g., "• **Term**: Description")
      if (trimmed.startsWith("• **") && trimmed.includes(":")) {
        const [termPart, ...descParts] = trimmed.slice(2).split(":");
        return (
          <div key={idx} className="term-definition">
            <strong>{termPart.replace(/\*\*/g, "").trim()}:</strong> {descParts.join(":").trim()}
          </div>
        );
      }
      
      // If the line is a level 1 bullet
      if (trimmed.startsWith("• ")) {
        const content = trimmed.slice(2).trim();
        // Split content by bold markers (or code segments) and build components
        const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          } else if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code key={i} style={{ background: "#f1f5f9", padding: "2px 4px", borderRadius: "4px" }}>
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={i}>{part}</span>;
        });
        return (
          <div key={idx} className="formatted-bullet bullet-level-1">
            • {parts}
          </div>
        );
      }
      
      // If the line is a level 2 bullet
      if (trimmed.startsWith("◦ ")) {
        const content = trimmed.slice(2).trim();
        return (
          <div key={idx} className="formatted-bullet bullet-level-2">
            ◦ {content}
          </div>
        );
      }
      
      // Fallback: render the line as is
      return (
        <div key={idx} className="formatted-bullet">
          {trimmed}
        </div>
      );
    });
    
    // Optionally, log the complete debug table in the console
    console.table(bulletElements.map((el, idx) => ({
      index: idx,
      className: el.props.className || "",
      content: el.props.children
    })));
    
    return bulletElements;
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
    try {
      const response = await axios.get(
        `${API_ROUTES.GET_S3_FILE_URL}?jobName=${this.state.jobName}`
      );
      const s3Url = response.data?.s3Url;
      if (!s3Url) throw new Error("No S3 URL");

      const proxy = "https://thingproxy.freeboard.io/fetch/";
      const s3Response = await axios.get(proxy + s3Url);
      const transcriptText =
        s3Response.data.results?.transcripts[0]?.transcript || "";

      if (!transcriptText) return;
      this.setState({ transcription: transcriptText });
    } catch (error) {
      console.error("❌ Fetch Transcription Error:", error);
    }
  };

  /** Summarize Transcription */
  handleSummarize = async () => {
    if (!this.state.transcription) {
      await this.handleFetchTranscription();
    }

    if (!this.state.transcription) {
      this.setState({ error: "⚠️ Cannot summarize. Transcription is missing." });
      return;
    }

    try {
      this.setState({
        isSummarizing: true,
        summaryContent: [],
        technicalDefinitions: [],
        progress: 0,
      });

      const { jobName, summaryOptions } = this.state;

      const response = await summarizeText(
        jobName,
        summaryOptions.length,
        summaryOptions.complexity,
        summaryOptions.format
      );

      const summaryText =
        response.data.summary?.summary || response.data.summary.text;
      const technicalTerms = response.data.technicalTerms || [];

      const bulletElements = this.parseBulletSummary(summaryText);
      this.setState({
        summaryContent: bulletElements,
        technicalDefinitions: technicalTerms,
        isSummarizing: false,
        progress: 100,
      });
    } catch (error) {
      console.error("❌ Summarization Error:", error);
      this.setState({
        isSummarizing: false,
        error: "⚠️ Failed to summarize. Please try again.",
      });
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
      <div className="app-container">
        <h1 className="section-wrapper centered-text">DT Summarizr</h1>
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
          <div className="section-wrapper">
            <h2 className="primary-btn">Summary</h2>
            <div className="formatted-summary">{this.state.summaryContent}</div>
          </div>
        )}

        <br />

        {this.state.technicalDefinitions.length > 0 && (
          <div className="section-wrapper">
            <h2>Technical Terms</h2>
            <ul>
              {this.state.technicalDefinitions.map((term, index) => {
                const [label, ...descParts] = term.split(":");
                return (
                  <li key={index} style={{ marginBottom: "0.75rem" }}>
                    <strong>{label.trim()}:</strong> {descParts.join(":").trim()}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

export default App;
