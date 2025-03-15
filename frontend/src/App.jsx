import React, { useState, useEffect } from "react";
import FileUploader from "./components/FileUploader";
import { transcribeFile, checkTranscriptionStatus, getTranscriptionText, summarizeText } from "./api";

const App = () => {
  const [jobName, setJobName] = useState("");
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("");

  const handleFileUpload = async (s3Url) => {
    try {
      const response = await transcribeFile(s3Url);
      setJobName(response.data.jobName);
      setStatus("Transcription started...");
    } catch (error) {
      console.error("Transcription Error:", error);
    }
  };

  const checkStatus = async () => {
    if (!jobName) return;
    const response = await checkTranscriptionStatus(jobName);
    setStatus(response.data.status);
  };

  const fetchTranscription = async () => {
    if (!jobName) return;
    const response = await getTranscriptionText(jobName);
    setTranscription(response.data.transcriptText);
  };

  const generateSummary = async () => {
    if (!transcription) return;
    const response = await summarizeText(transcription);
    setSummary(response.data.summary);
  };

  // ✅ Auto-check transcription status every 5 sec
  useEffect(() => {
    if (jobName && status !== "COMPLETED") {
      const interval = setInterval(() => {
        checkStatus();
      }, 5000); // ✅ Check status every 5 sec

      return () => clearInterval(interval); // ✅ Cleanup function
    }
  }, [jobName, status]); // ✅ Runs whenever jobName or status changes

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">Call Center Summarization</h1>

      <FileUploader onFileUpload={handleFileUpload} />

      {jobName && (
        <div className="mt-6 text-center p-4 bg-white shadow-lg rounded-lg w-full max-w-lg">
          <p className="text-gray-700 font-semibold">Job Name: {jobName}</p>
          <p className="text-gray-500">Status: {status}</p>
          <button onClick={checkStatus} className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded">
            Check Status
          </button>
        </div>
      )}

      {status === "COMPLETED" && !transcription && (
        <button onClick={fetchTranscription} className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded">
          Get Transcription
        </button>
      )}

      {transcription && (
        <div className="mt-4 p-4 bg-gray-100 shadow-md rounded-lg w-full max-w-xl">
          <h2 className="font-bold text-lg">Transcription:</h2>
          <p className="text-gray-700">{transcription}</p>
          <button onClick={generateSummary} className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded">
            Summarize
          </button>
        </div>
      )}

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