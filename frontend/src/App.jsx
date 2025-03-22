import React, { Component } from "react";
import { uploadFile, checkTranscriptionStatus, summarizeText, getTranscriptionText } from "./api";
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
            summary: "",
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

        if (
            (this.state.selectedType === "audio" && !selectedFile.name.endsWith(".mp3")) ||
            (this.state.selectedType === "video" && !selectedFile.name.endsWith(".mp4"))
        ) {
            this.setState({ error: "❌ Please select a valid file type." });
            return;
        }

        this.setState({ error: "", file: selectedFile });
        console.log("📂 File selected:", selectedFile.name);
    };

    /** Upload File */
    handleUpload = async () => {
        if (!this.state.file) {
            this.setState({ error: "❌ Please select a file before uploading." });
            return;
        }

        console.log("📤 Uploading file...");
        try {
            const response = await uploadFile(this.state.file);
            if (response.data?.transcriptionJobId) {
                this.setState({ jobName: response.data.transcriptionJobId, status: "Processing..." });
                console.log("🔄 Job started:", response.data.transcriptionJobId);
            }
        } catch (err) {
            console.error("❌ File Upload Error:", err);
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

    /** Simulate Progress Bar */
    simulateProgress = () => {
        this.setState({ progress: 0, isCanceled: false });
        let progressInterval = setInterval(() => {
            if (this.state.isCanceled) {
                clearInterval(progressInterval);
                this.setState({ isSummarizing: false, progress: 0 });
                return;
            }
            if (this.state.progress >= 100) {
                clearInterval(progressInterval);
                return;
            }
            this.setState((prevState) => ({ progress: prevState.progress + 10 }));
        }, 500);
    };

    /** Cancel Summarization */
    handleCancelSummarization = () => {
        console.log("❌ Summarization canceled.");
        this.setState({ isCanceled: true, isSummarizing: false, progress: 0 });
    };

    /** Summarize Transcription */
    handleSummarize = async () => {
        if (!this.state.transcription) {
            console.warn("⚠️ No transcription found. Fetching first...");
            await this.handleFetchTranscription();
        }

        console.log("🔄 Starting Summarization...");
        this.setState({ isSummarizing: true, progress: 0, summary: "" });

        // Simulate Progress
        this.simulateProgress();

        try {
            const response = await summarizeText(
                this.state.jobName,
                "concise",
                "simplified",
                "bullet-pointed"
            );

            if (response.data.summary?.kwargs?.content) {
                this.setState({ summary: response.data.summary.kwargs.content, isSummarizing: false, progress: 100 });
                console.log("✅ Extracted Concise Summary:", response.data.summary.kwargs.content);
            }
        } catch (error) {
            console.error("❌ Error fetching summary:", error);
            this.setState({ isSummarizing: false, progress: 0 });
        }
    };

    /** Reset for New Summarization */
    handleNewSummarization = () => {
        this.setState({
            selectedType: null,
            file: null,
            error: "",
            jobName: "",
            status: "",
            summary: "",
            transcription: "",
            isSummarizing: false,
            progress: 0,
            isCanceled: false
        });
    };

    render() {
        console.log("📌 Current App State:", this.state); 

        return (
            <div className="app-container">
                <h1>DT Summarizer</h1>
                <p>Transform your content into concise, meaningful summaries</p>

                {/* Select Content Type */}
                <div className="card">
                    <h2>Select Content Type</h2>
                    <div className="btn-group">
                        <button 
                            className={`option-btn ${this.state.selectedType === "audio" ? "selected" : ""}`} 
                            onClick={() => this.setState({ selectedType: "audio", file: null })}
                        >
                            🎵 Audio File (MP3)
                        </button>
                        <button 
                            className={`option-btn ${this.state.selectedType === "video" ? "selected" : ""}`} 
                            onClick={() => this.setState({ selectedType: "video", file: null })}
                        >
                            🎥 Video File (MP4)
                        </button>
                    </div>
                </div>

                {/* Upload File */}
                {this.state.selectedType && (
                    <div className="card">
                        <h2>Upload Content</h2>
                        <input type="file" onChange={this.handleFileChange} />
                        <button 
                            className="primary-btn" 
                            onClick={this.handleUpload} 
                            disabled={!this.state.file || !this.state.selectedType}
                        >
                            Upload & Transcribe
                        </button>
                    </div>
                )}

                {/* Job Status & Summarize */}
                {this.state.jobName && (
                    <div className="card">
                        <h2>Job Status: ✅ {this.state.status}</h2>
                        <button className="status-btn" onClick={this.handleCheckStatus}>
                            Check Status
                        </button>

                        {this.state.status === "COMPLETED" && (
                            <>
                                <button 
                                    className={`summarize-btn ${this.state.isSummarizing ? "loading" : ""}`} 
                                    onClick={this.handleSummarize} 
                                    disabled={this.state.isSummarizing}
                                >
                                    Summarize
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Display Summary */}
                {this.state.summary && (
                    <div className="summary-card">
                        <h2>📌 Summary:</h2>
                        <ul dangerouslySetInnerHTML={{ __html: this.state.summary }} />
                        <button className="secondary-btn" onClick={this.handleNewSummarization}>
                            Summarize Something Else
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

export default App;