import React from 'react';
import { useState } from "react";
import { uploadFile, checkTranscriptionStatus, summarizeTranscription, getTranscriptionText } from "./api";

const App = () => {
    const [selectedType, setSelectedType] = useState(null);
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [jobName, setJobName] = useState("");
    const [status, setStatus] = useState("");
    const [summary, setSummary] = useState("");
    const [transcription, setTranscription] = useState("");
    const [summaryOptions, setSummaryOptions] = useState({ length: "regular", complexity: "regular", format: "bullet-pointed" });

    // ✅ Handle file selection
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Validate file type
        if (
            (selectedType === "audio" && !selectedFile.name.endsWith(".mp3")) ||
            (selectedType === "video" && !selectedFile.name.endsWith(".mp4"))
        ) {
            setError("Please select a valid file type.");
            return;
        }

        setError("");
        setFile(selectedFile);

        try {
            const response = await uploadFile(selectedFile);
            setJobName(response.transcriptionJobId);
            setStatus("Processing...");
        } catch (err) {
            console.error("❌ File Upload Error:", err);
            setError("Failed to upload file.");
        }
    };

    // ✅ Check transcription status
    const handleCheckStatus = async () => {
        if (!jobName) return;
        try {
            const response = await checkTranscriptionStatus(jobName);
            setStatus(response.status);
        } catch (err) {
            console.error("⚠️ Status Check Error:", err);
        }
    };

    const handleFetchTranscription = async () => {
        if (!jobName) {
            console.warn("⚠️ No jobName found. Cannot fetch transcription.");
            return;
        }
    
        console.log("🔄 Fetching transcription for job:", jobName);
    
        try {
            const text = await getTranscriptionText(jobName);
            console.log("📜 Raw API Response (Transcription):", text); // ✅ Log response
    
            if (!text || text.trim() === "") {
                console.error("❌ No transcription text found after API call.");
                return;
            }
    
            setTranscription(text); // ✅ Update state
            console.log("✅ Transcription state updated:", text); // ✅ Log final transcription
    
        } catch (error) {
            console.error("❌ Error fetching transcription:", error);
        }
    };    
    
    
    // ✅ Summarize transcription
    const handleSummarize = async () => {
        if (!transcription || transcription.trim() === "") {
            console.warn("⚠️ No transcription found. Fetching first...");
            await handleFetchTranscription();
        }
    
        setTimeout(async () => {
            console.log("📜 Final Transcription Before Summarization:", transcription); // ✅ Log final transcription
    
            if (!transcription || transcription.trim() === "") {
                console.error("❌ Transcription is still empty. Cannot summarize.");
                return;
            }
    
            console.log("🔄 Summarizing transcription:", transcription);
    
            try {
                const response = await summarizeTranscription(
                    jobName,
                    summaryOptions.length,
                    summaryOptions.complexity,
                    summaryOptions.format
                );
    
                console.log("✅ Summary Response:", response);
    
                if (!response.summary) {
                    console.error("❌ Summary data is missing:", response);
                    return;
                }
    
                setSummary(response.summary.text || "No summary available"); // ✅ Ensure correct access to summary
            } catch (error) {
                console.error("❌ Error fetching summary:", error);
            }
        }, 1000); // ✅ Short delay to allow state update
    };
    
    
    
    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">DT Summarizer</h1>
            <p className="text-gray-500 mb-6">Transform your content into concise, meaningful summaries</p>

            {/* Step 1: Select Content Type */}
            <div className="w-full max-w-lg bg-white p-6 shadow-lg rounded-lg">
                <h2 className="text-lg font-semibold mb-4">1. Select Content Type</h2>
                <div className="flex gap-4">
                    <button
                        className={`p-4 border rounded-lg w-full ${selectedType === "audio" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
                        onClick={() => setSelectedType("audio")}
                    >
                        Audio File (MP3)
                    </button>
                    <button
                        className={`p-4 border rounded-lg w-full ${selectedType === "video" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
                        onClick={() => setSelectedType("video")}
                    >
                        Video File (MP4)
                    </button>
                </div>
            </div>

            {/* Step 2: Upload File */}
            {selectedType && (
                <div className="w-full max-w-lg bg-white p-6 shadow-lg rounded-lg mt-6">
                    <h2 className="text-lg font-semibold mb-4">2. Upload Content</h2>
                    <input type="file" onChange={handleFileChange} className="block w-full p-2 border rounded-lg" />
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    {file && <p className="text-gray-700 mt-2">Selected: {file.name}</p>}
                    <button className="mt-4 px-6 py-3 bg-blue-600 text-white rounded w-full transition" disabled={!file}>
                        Upload & Transcribe
                    </button>
                </div>
            )}

            {/* Step 3: Check Transcription Status */}
            {jobName && (
                <div className="w-full max-w-lg bg-white p-6 shadow-lg rounded-lg mt-6">
                    <h2 className="text-lg font-semibold">Job Status: {status}</h2>
                    <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded w-full transition" onClick={handleCheckStatus}>
                        Check Status
                    </button>
                </div>
            )}

            {/* Step 4: Summarize Transcription */}
            {status === "COMPLETED" && (
                <button className="mt-4 px-6 py-3 bg-purple-600 text-white rounded" onClick={handleSummarize}>
                    Summarize
                </button>
            )}

            {/* Step 5: Display Summary */}
            {summary && (
                <div className="mt-4 p-4 bg-gray-200 shadow-md rounded-lg w-full max-w-xl">
                    <h2 className="font-bold text-lg">Summary:</h2>
                    <p className="text-gray-700">{summary.text || "No summary available"}</p>
                </div>
            )}
        </div>
    );
}

export default App;