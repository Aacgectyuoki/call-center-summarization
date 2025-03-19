import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/aws"; // Adjust based on backend URL

// ✅ Upload file to AWS S3 and start transcription
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data; // { message, transcriptionJobId }
};

// ✅ Check transcription status
export const checkTranscriptionStatus = async (jobName) => {
    const response = await axios.get(`${API_BASE_URL}/transcription-status?jobName=${jobName}`);
    return response.data; // { jobName, status, transcriptUrl }
};

// ✅ Fetch transcription text
export const getTranscriptionText = async (jobName) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/transcription-text?jobName=${jobName}`);
        console.log("📜 Received Transcription:", response.data); // Debugging output
        return response.data; // ✅ Ensure returning the correct data
    } catch (error) {
        console.error("❌ Error fetching transcription text:", error);
        return null; // ✅ Return null on failure to avoid undefined issues
    }
};

// ✅ Summarize transcription
export const summarizeTranscription = async (jobName, length, complexity, format) => {
    const response = await axios.post(`${API_BASE_URL}/summarize`, {
        jobName,
        length,
        complexity,
        format,
    });
    return response.data; // { jobName, summary }
};