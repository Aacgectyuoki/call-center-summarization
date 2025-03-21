import React, { useState } from "react";
import { uploadFile, checkTranscriptionStatus, summarizeText, getTranscriptionText } from "./api";

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
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Validate file type
        if (
            (selectedType === "audio" && !selectedFile.name.endsWith(".mp3")) ||
            (selectedType === "video" && !selectedFile.name.endsWith(".mp4"))
        ) {
            setError("❌ Please select a valid file type.");
            return;
        }

        setError("");
        setFile(selectedFile);
    };

    // ✅ Upload & Transcribe
    const handleUpload = async () => {
        if (!file) {
            setError("❌ Please select a file before uploading.");
            return;
        }

        try {
            const response = await uploadFile(file);
            console.log("✅ Upload Response:", response.data); // Debugging

            if (response.data && response.data.transcriptionJobId) {
                setJobName(response.data.transcriptionJobId);
                setStatus("Processing...");
            } else {
                console.error("❌ Upload response does not contain transcriptionJobId:", response.data);
                setError("Failed to upload file. No transcription ID received.");
            }
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
            console.log("📡 Transcription Status Response:", response.data);

            if (response.data && response.data.status) {
                setStatus(response.data.status);

                if (response.data.status === "COMPLETED") {
                    console.log("✅ Transcription is completed.");
                } else {
                    console.warn("⚠️ Transcription is still processing...");
                }
            } else {
                console.error("❌ Invalid status response:", response.data);
                setError("Failed to fetch transcription status.");
            }
        } catch (err) {
            console.error("⚠️ Status Check Error:", err);
        }
    };

    // ✅ Fetch transcription
    const handleFetchTranscription = async () => {
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
    
            // ✅ Ensure state is updated before summarization
            setTranscription(response.data.transcriptText);
            console.log("✅ Transcription stored in state:", response.data.transcriptText);
            return response.data.transcriptText; // ✅ Return transcription text for further use
    
        } catch (error) {
            console.error("❌ Error fetching transcription:", error);
        }
    };    

    // ✅ Summarize transcription
    const handleSummarize = async () => {
        console.log("Current transcription before summarization:", transcription);
    
        let transcriptToUse = transcription;
    
        if (!transcriptToUse || transcriptToUse.trim() === "") {
            console.warn("⚠️ No transcription found. Fetching first...");
            transcriptToUse = await handleFetchTranscription(); // ✅ Wait for the transcript
    
            // ✅ Double-check if we got valid text
            if (!transcriptToUse || transcriptToUse.trim() === "") {
                console.error("❌ Transcription is still empty. Cannot summarize.");
                return;
            }
        }
    
        console.log("🔄 Summarizing transcription:", transcriptToUse);
    
        try {
            const response = await summarizeText(
                jobName,
                summaryOptions.length,
                summaryOptions.complexity,
                summaryOptions.format
            );
    
            console.log("✅ Summary Response:", response.data);
    
            // ✅ Fix: Extract summary correctly from response
            if (response.data.summary?.kwargs?.content) {
                setSummary(response.data.summary.kwargs.content);
                console.log("✅ Summary stored in state:", response.data.summary.kwargs.content);
            } else {
                console.error("❌ Summary data is missing:", response);
            }
    
        } catch (error) {
            console.error("❌ Error fetching summary:", error);
        }
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

                    <button 
                        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded w-full transition"
                        disabled={!file}
                        onClick={handleUpload}
                    >
                        Upload & Transcribe
                    </button>
                </div>
            )}

            {/* Step 3: Check Transcription Status */}
            {jobName && (
                <div className="w-full max-w-lg bg-white p-6 shadow-lg rounded-lg mt-6">
                    <h2 className="text-lg font-semibold">
                        Job Status: {status === "COMPLETED" ? "✅ Completed" : "⏳ Processing..."}
                    </h2>
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
                    <p className="text-gray-700">{summary || "No summary available"}</p>
                </div>
            )}
        </div>
    );
};

export default App;