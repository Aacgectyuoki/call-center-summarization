import React, { Component } from "react";
import FileUploader from "./components/FileUploader";
import axios from "axios";
import { checkTranscriptionStatus, summarizeText, getTranscriptionText } from "./api";
import "./App.css";
import { API_ROUTES } from "./config";

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
      // We no longer need uploadedFileUrl since the backend doesn't return one
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

    this.setState({ error: "", file: selectedFile });
    console.log("📂 File selected:", selectedFile.name);
  };

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

    // Expecting transcriptionJobId from backend
    if (response.data?.transcriptionJobId) {
      this.setState({ 
        jobName: response.data.transcriptionJobId,
        status: "IN_PROGRESS"  // <-- Initialize status here
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
    // Call the backend endpoint to get the S3 URL
    const urlResponse = await axios.get(`${API_ROUTES.GET_S3_FILE_URL}?jobName=${this.state.jobName}`);
    if (urlResponse.data?.s3Url) {
      const s3Url = urlResponse.data.s3Url;
      console.log("✅ Retrieved S3 URL:", s3Url);
      
      // Use an alternative CORS proxy for testing (temporary workaround)
      const corsProxy = "https://thingproxy.freeboard.io/fetch/";
      const s3Response = await axios.get(corsProxy + s3Url);
      
      // Parse the S3 JSON response
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
      this.setState({
        summaryContent: summaryText.split("\n").map((line, index) => <div key={index}>{line}</div>),
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
    // Start polling for progress if a job is in progress and no interval is set
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

        {/* Upload Section (shown only if no job is started) */}
        {!this.state.jobName && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Content</h2>
            <FileUploader setFile={(file) => this.setState({ file })} setError={(error) => this.setState({ error })} />
            <div className="flex space-x-4 mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={this.handleUpload} disabled={!this.state.file}>
                Upload & Start Transcription
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
            <h2 className="text-xl font-semibold mb-4">Transcription</h2>
            <p className="mb-4 whitespace-pre-wrap">{this.state.transcription}</p>
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