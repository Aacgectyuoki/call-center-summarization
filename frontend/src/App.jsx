import { useState } from "react";
import FileUploader from "./components/FileUploader";
import { checkTranscriptionStatus, getTranscriptionText, summarizeText } from "./api";
import React from "react";

const App = () => {
    const [jobName, setJobName] = useState("");
    const [status, setStatus] = useState("");
    const [transcription, setTranscription] = useState("");
    const [summary, setSummary] = useState("");
    const [summarySettings, setSummarySettings] = useState({
        length: "regular",
        complexity: "regular",
        format: "regular",
    });

    const handleUploadSuccess = (data) => {
        setJobName(data.transcriptionJobId);
        setStatus("Processing...");
    };

    const handleCheckStatus = async () => {
        if (!jobName) return;
        const response = await checkTranscriptionStatus(jobName);
        setStatus(response.data.status);
    };

    const handleFetchTranscription = async () => {
        if (!jobName) return;
        const response = await getTranscriptionText(jobName);
        setTranscription(response.data.transcriptText);
    };

    const handleSummarize = async () => {
        if (!transcription) return;
        const response = await summarizeText(jobName, summarySettings.length, summarySettings.complexity, summarySettings.format);
        setSummary(response.data.summary);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-3xl font-bold text-gray-800">AI Transcription & Summarization</h1>
            
            {/* Upload Section */}
            <FileUploader onUploadSuccess={handleUploadSuccess} />

            {/* Status Section */}
            {jobName && (
                <div className="mt-6 text-center p-4 bg-white shadow-lg rounded-lg w-full max-w-lg">
                    <p className="text-gray-700 font-semibold">Job Name: {jobName}</p>
                    <p className="text-gray-500">Status: {status}</p>
                    <button onClick={handleCheckStatus} className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded">
                        Check Status
                    </button>
                </div>
            )}

            {/* Transcription Section */}
            {status === "COMPLETED" && !transcription && (
                <button onClick={handleFetchTranscription} className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded">
                    Get Transcription
                </button>
            )}

            {transcription && (
                <div className="mt-4 p-4 bg-gray-100 shadow-md rounded-lg w-full max-w-xl">
                    <h2 className="font-bold text-lg">Transcription:</h2>
                    <p className="text-gray-700">{transcription}</p>
                    <button onClick={handleSummarize} className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded">
                        Summarize
                    </button>
                </div>
            )}

            {/* Summary Section */}
            {summary && (
                <div className="mt-4 p-4 bg-gray-200 shadow-md rounded-lg w-full max-w-xl">
                    <h2 className="font-bold text-lg">Summary:</h2>
                    <p className="text-gray-700">{summary}</p>
                </div>
            )}
        </div>
    );
};

export default App;
