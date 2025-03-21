import React, { Component } from "react";
import { uploadFile, checkTranscriptionStatus, summarizeText, getTranscriptionText } from "./api";

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
            summaryOptions: { length: "regular", complexity: "regular", format: "bullet-pointed" },
            forceRender: false // Force re-render if needed
        };
    }

    // ✅ Handle file selection
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

        console.log("📂 File selected:", selectedFile.name);
        this.setState({ error: "", file: selectedFile });
    };

    // ✅ Upload & Transcribe
    handleUpload = async () => {
        const { file } = this.state;
        if (!file) {
            this.setState({ error: "❌ Please select a file before uploading." });
            return;
        }

        console.log("📤 Uploading file...");
        try {
            const response = await uploadFile(file);
            console.log("✅ Upload Response:", response.data);

            if (response.data && response.data.transcriptionJobId) {
                this.setState({ jobName: response.data.transcriptionJobId, status: "Processing..." });
                console.log("🔄 Job started:", response.data.transcriptionJobId);
            } else {
                console.error("❌ Upload response missing transcriptionJobId:", response.data);
                this.setState({ error: "Failed to upload file. No transcription ID received." });
            }
        } catch (err) {
            console.error("❌ File Upload Error:", err);
            this.setState({ error: "Failed to upload file." });
        }
    };

    // // ✅ Check transcription status
    // handleCheckStatus = async () => {
    //     const { jobName } = this.state;
    //     if (!jobName) {
    //         console.warn("⚠️ No jobName found.");
    //         return;
    //     }

    //     console.log("📡 Checking transcription status for:", jobName);
    //     try {
    //         const response = await checkTranscriptionStatus(jobName);
    //         console.log("📡 Transcription Status Response:", response.data);

    //         if (response.data && response.data.status) {
    //             this.setState({ status: response.data.status }, () => {
    //                 console.log("✅ Status updated:", this.state.status);
                    
    //                 if (response.data.status === "COMPLETED") {
    //                     console.log("🎉 Transcription is completed.");
    //                 } else {
    //                     console.warn("⏳ Transcription is still processing...");
    //                 }

    //                 // ✅ Force re-render to update UI
    //                 this.setState((prevState) => ({
    //                     forceRender: !prevState.forceRender
    //                 }));
    //             });
    //         } else {
    //             console.error("❌ Invalid status response:", response.data);
    //             this.setState({ error: "Failed to fetch transcription status." });
    //         }
    //     } catch (err) {
    //         console.error("⚠️ Status Check Error:", err);
    //     }
    // };

    // ✅ Fetch transcription
    handleFetchTranscription = async () => {
        const { jobName } = this.state;
        if (!jobName) {
            console.warn("⚠️ No jobName found. Cannot fetch transcription.");
            return;
        }
    
        console.log("🔄 Fetching transcription for job:", jobName);
        try {
            const response = await getTranscriptionText(jobName);
            console.log("✅ Transcription API Response:", response.data);
    
            if (!response.data.transcriptText || typeof response.data.transcriptText !== "string") {
                console.error("❌ No transcription text found:", response.data);
                return;
            }
    
            // ✅ Ensure state updates before summarization
            this.setState({ transcription: response.data.transcriptText }, () => {
                console.log("✅ Transcription stored:", this.state.transcription);
            });
    
        } catch (error) {
            console.error("❌ Error fetching transcription:", error);
        }
    };
    

    // ✅ Summarize transcription
    handleSummarize = async () => {
        console.log("🔍 Checking transcription before summarization:", this.state.transcription);
    
        // ✅ Ensure transcription exists by fetching it first if it's missing
        if (!this.state.transcription || this.state.transcription.trim() === "") {
            console.warn("⚠️ No transcription found. Fetching first...");
            await this.handleFetchTranscription();
    
            // ✅ Wait a bit to ensure state updates
            await new Promise(resolve => setTimeout(resolve, 1000));
    
            if (!this.state.transcription || this.state.transcription.trim() === "") {
                console.error("❌ Transcription is still empty. Cannot summarize.");
                return;
            }
        }
    
        console.log("🔄 Summarizing transcription...");
        try {
            const response = await summarizeText(
                this.state.jobName,
                this.state.summaryOptions.length,
                this.state.summaryOptions.complexity,
                this.state.summaryOptions.format
            );
    
            console.log("✅ Full Summary Response:", response.data);
    
            if (response.data.summary?.kwargs?.content) {
                console.log("✅ Extracted Summary:", response.data.summary.kwargs.content);
                this.setState({ summary: response.data.summary.kwargs.content });
            } else {
                console.error("❌ Summary data is missing:", response);
            }
        } catch (error) {
            console.error("❌ Error fetching summary:", error);
        }
    };
    
    // ✅ Auto-fetch transcription once status is "COMPLETED"
    handleCheckStatus = async () => {
        const { jobName } = this.state;
        if (!jobName) {
            console.warn("⚠️ No jobName found.");
            return;
        }

        console.log("📡 Checking transcription status for:", jobName);
        try {
            const response = await checkTranscriptionStatus(jobName);
            console.log("📡 Transcription Status Response:", response.data);

            if (response.data && response.data.status) {
                this.setState({ status: response.data.status }, async () => {
                    console.log("✅ Status updated:", this.state.status);

                    if (response.data.status === "COMPLETED") {
                        console.log("🎉 Transcription is completed. Fetching now...");
                        
                        // ✅ Auto-fetch transcription
                        await this.handleFetchTranscription();

                        // ✅ Force re-render to enable Summarize button
                        this.setState((prevState) => ({
                            forceRender: !prevState.forceRender
                        }));
                    } else {
                        console.warn("⏳ Transcription is still processing...");
                    }
                });
            } else {
                console.error("❌ Invalid status response:", response.data);
                this.setState({ error: "Failed to fetch transcription status." });
            }
        } catch (err) {
            console.error("⚠️ Status Check Error:", err);
        }
    };

    // ✅ Ensure Summarize button is always enabled after fetching transcription
    render() {
        return (
            <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">DT Summarizer</h1>
                <p className="text-gray-500 mb-6">Transform your content into concise, meaningful summaries</p>

                {/* Step 1: Select Content Type */}
                <div className="w-full max-w-lg bg-white p-6 shadow-lg rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">1. Select Content Type</h2>
                    <div className="flex gap-4">
                        <button className={`p-4 border rounded-lg w-full ${this.state.selectedType === "audio" ? "bg-blue-600 text-white" : "bg-gray-100"}`} 
                            onClick={() => this.setState({ selectedType: "audio" })}>
                            Audio File (MP3)
                        </button>
                        <button className={`p-4 border rounded-lg w-full ${this.state.selectedType === "video" ? "bg-blue-600 text-white" : "bg-gray-100"}`} 
                            onClick={() => this.setState({ selectedType: "video" })}>
                            Video File (MP4)
                        </button>
                    </div>
                </div>

                {/* Step 2: Upload File */}
                {this.state.selectedType && (
                    <div className="w-full max-w-lg bg-white p-6 shadow-lg rounded-lg mt-6">
                        <h2 className="text-lg font-semibold mb-4">2. Upload Content</h2>
                        <input type="file" onChange={this.handleFileChange} className="block w-full p-2 border rounded-lg" />
                        {this.state.error && <p className="text-red-500 mt-2">{this.state.error}</p>}
                        {this.state.file && <p className="text-gray-700 mt-2">Selected: {this.state.file.name}</p>}

                        <button 
                            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded w-full transition"
                            disabled={!this.state.file}
                            onClick={this.handleUpload}
                        >
                            Upload & Transcribe
                        </button>
                    </div>
                )}

                {/* Step 3: Check Status & Summarize */}
                {this.state.jobName && (
                    <div className="w-full max-w-lg bg-white p-6 shadow-lg rounded-lg mt-6">
                        <h2 className="text-lg font-semibold">
                            Job Status: {this.state.status === "COMPLETED" ? "✅ Completed" : "⏳ Processing..."}
                        </h2>
                        <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded w-full transition" onClick={this.handleCheckStatus}>
                            Check Status
                        </button>

                        {/* ✅ Summarize Button Always Available After Completion */}
                        {this.state.status === "COMPLETED" && (
                            <button 
                                className={`mt-4 px-6 py-3 ${this.state.transcription ? "bg-purple-600" : "bg-gray-400"} text-white rounded w-full transition`} 
                                onClick={this.handleSummarize}
                                disabled={!this.state.transcription} // Button enabled only when transcription exists
                            >
                                {this.state.summary ? "Re-Summarize" : "Summarize"}
                            </button>
                        )}
                    </div>
                )}

                {/* Step 4: Display Summary */}
                {this.state.summary && (
                    <div className="mt-4 p-4 bg-gray-200 shadow-md rounded-lg w-full max-w-xl">
                        <h2 className="font-bold text-lg">Summary:</h2>
                        <p className="text-gray-700">{this.state.summary}</p>
                    </div>
                )}
            </div>
        );
    }
}

export default App;