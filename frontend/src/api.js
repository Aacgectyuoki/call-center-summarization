import axios from "axios";
import { API_ROUTES } from "./config";

// Upload File
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axios.post(API_ROUTES.UPLOAD, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// Transcribe File
export const transcribeFile = async (fileId) => {
    return axios.post(API_ROUTES.TRANSCRIBE, { fileId });
};

// Get Transcription Status
export const checkTranscriptionStatus = async (jobName) => {
    console.log("Checking status for:", jobName); // Debugging
    return axios.get(`${API_ROUTES.CHECK_STATUS}?jobName=${jobName}`);
};


// Fetch Transcription Text
export const getTranscriptionText = async (jobName) => {
    return axios.get(`${API_ROUTES.GET_TRANSCRIPTION_TEXT}?jobName=${jobName}`);
};

// Summarize Transcription
export const summarizeText = async (jobName, length, complexity, format) => {
    return axios.post(API_ROUTES.SUMMARIZE, { jobName, length, complexity, format });
};
