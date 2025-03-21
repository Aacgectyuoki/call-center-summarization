import React, { Component } from "react";
import { uploadFile, checkTranscriptionStatus, summarizeText, getTranscriptionText } from "./api";
import "./App.css"; // Import CSS for better styling

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedType: "audio",  // 👈 Set default to "audio" or "video"
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

    handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        this.setState({ error: "", file: selectedFile });
        console.log("📂 File selected:", selectedFile.name);
    };

    handleUpload = async () => {
        const { file } = this.state;
        if (!file) {
            this.setState({ error: "❌ Please select a file before uploading." });
            return;
        }

        console.log("📤 Uploading file...");
        try {
            const response = await uploadFile(file);
            if (response.data?.transcriptionJobId) {
                this.setState({ jobName: response.data.transcriptionJobId, status: "Processing..." });
                console.log("🔄 Job started:", response.data.transcriptionJobId);
            }
        } catch (err) {
            console.error("❌ File Upload Error:", err);
        }
    };

    handleCheckStatus = async () => {
        const { jobName } = this.state;
        if (!jobName) return;

        console.log("📡 Checking transcription status for:", jobName);
        try {
            const response = await checkTranscriptionStatus(jobName);
            if (response.data?.status) {
                this.setState({ status: response.data.status }, () => {
                    console.log("✅ Status updated:", this.state.status);
                });
            }
        } catch (err) {
            console.error("⚠️ Status Check Error:", err);
        }
    };

    handleFetchTranscription = async () => {
        const { jobName } = this.state;
        if (!jobName) return;

        console.log("🔄 Fetching transcription for job:", jobName);
        try {
            const response = await getTranscriptionText(jobName);
            if (response.data?.transcriptText) {
                this.setState({ transcription: response.data.transcriptText });
                console.log("✅ Transcription stored:", response.data.transcriptText);
            }
        } catch (error) {
            console.error("❌ Error fetching transcription:", error);
        }
    };

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

    handleCancelSummarization = () => {
        console.log("❌ Summarization canceled.");
        this.setState({ isCanceled: true });
    };

    handleSummarize = async () => {
        if (!this.state.transcription) {
            console.warn("⚠️ No transcription found. Fetching first...");
            await this.handleFetchTranscription();
        }

        console.log("🔄 Starting Summarization...");
        this.setState({ isSummarizing: true, progress: 0, summary: "" });

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
        console.log("Rendering App - Current State:", this.state);
        return (
            <div className="app-container">
                <h1>DT Summarizer</h1>
                <p>Transform your content into concise, meaningful summaries</p>

                {/* Upload File */}
                {this.state.selectedType && (
                    <div className="card">
                        {!this.state.selectedType && (
                            <div className="text-center text-gray-500 mt-6">
                                <p>⚠️ Please select a content type to continue.</p>
                            </div>
                        )}
                        <h2>Upload Content</h2>
                        <input type="file" onChange={this.handleFileChange} />
                        <br></br>
                        <button className="primary-btn" onClick={this.handleUpload}>
                            Upload & Transcribe
                        </button>
                    </div>
                )}

                {/* Check Status & Summarize */}
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
                                    {this.state.isSummarizing ? `Summarizing... (${this.state.progress}%)` : this.state.summary ? "Re-Summarize" : "Summarize"}
                                </button>
                                {this.state.isSummarizing && <button className="cancel-btn" onClick={this.handleCancelSummarization}>Cancel</button>}
                            </>
                        )}
                    </div>
                )}

                {/* Summary Display */}
                {this.state.summary && (
                    <div className="summary-card">
                        <h2>📌 Summary:</h2>
                        <p dangerouslySetInnerHTML={{ __html: this.state.summary }} />
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
