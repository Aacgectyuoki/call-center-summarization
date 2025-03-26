import React, { Component } from "react";
import FileUploader from "./components/FileUploader";
import axios from "axios";
import { checkTranscriptionStatus, summarizeText, getTranscriptionText } from "./api";
import "./App.css";

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
            isCanceled: false
        };
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

    /** Upload File */
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
  
          if (response.data?.fileUrl) {
              this.setState({ uploadedFileUrl: response.data.fileUrl });  // ✅ Store file URL
              console.log("✅ File uploaded successfully:", response.data.fileUrl);
          } else {
              console.warn("⚠️ Upload successful, but no file URL received.");
          }
      } catch (error) {
          console.error("❌ File Upload Error:", error);
          this.setState({ error: "⚠️ Failed to upload file. Please try again." });
      }
  };
  

    /** Start Transcription */
    handleStartTranscription = async () => {
      if (!this.state.file) {
          console.warn("⚠️ No file uploaded for transcription.");
          return;
      }
  
      console.log("📡 Starting transcription for:", this.state.file.name);
      try {
          const response = await axios.post(
              "http://localhost:5000/api/aws/transcribe",
              { 
                  fileUrl: this.state.uploadedFileUrl  // ✅ Use uploaded S3 file URL
              },
              { headers: { "Content-Type": "application/json" } }
          );
  
          if (response.data?.jobName) {
              this.setState({ jobName: response.data.jobName, status: "IN_PROGRESS" });
              console.log("✅ Transcription started. Job Name:", response.data.jobName);
          } else {
              console.warn("⚠️ Transcription started but no job name received.");
          }
      } catch (error) {
          console.error("❌ Transcription Start Error:", error);
          this.setState({ error: "⚠️ Failed to start transcription. Please try again." });
      }
  };
  

    /** Check Transcription Status */
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

                if (response.data.status === "COMPLETED") {
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
            const response = await getTranscriptionText(this.state.jobName);
            if (response.data?.transcriptText) {
                this.setState({ transcription: response.data.transcriptText });
                console.log("✅ Transcription stored:", response.data.transcriptText);
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

    render() {
        return (
            <div className="app-container">
                <h1>DT Summarizr</h1>
                <p>Transform your content into concise, meaningful summaries</p>

                {/* Select Content Type */}
                <div className="card">
                    <h2>Select Content Type</h2>
                    <div className="btn-group">
                        <button className={`option-btn ${this.state.selectedType === "audio" ? "selected" : ""}`} onClick={() => this.setState({ selectedType: "audio", file: null })}>
                            🎵 Audio File (MP3)
                        </button>
                        <button className={`option-btn ${this.state.selectedType === "video" ? "selected" : ""}`} onClick={() => this.setState({ selectedType: "video", file: null })}>
                            🎥 Video File (MP4)
                        </button>
                    </div>
                </div>

                {this.state.selectedType && (
                    <div className="card">
                        <h2>Upload Content</h2>
                        <FileUploader setFile={(file) => this.setState({ file })} setError={(error) => this.setState({ error })} />
                        <button className="primary-btn" onClick={this.handleUpload} disabled={!this.state.file}>Upload</button>
                        <button className="primary-btn" onClick={this.handleStartTranscription} disabled={!this.state.file}>Start Transcription</button>
                    </div>
                )}
            </div>
        );
    }
}

export default App;
