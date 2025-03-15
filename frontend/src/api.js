import axios from "axios";
import { API_ROUTES } from "./config";

// 📌 Upload File to Backend
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(API_ROUTES.UPLOAD, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 📌 Start Transcription
export const transcribeFile = async (s3Url) => {
  return axios.post(API_ROUTES.TRANSCRIBE, { audioUrl: s3Url });
};

// 📌 Check Transcription Status
export const checkTranscriptionStatus = async (jobName) => {
  return axios.get(`${API_ROUTES.CHECK_STATUS}?jobName=${jobName}`);
};

// 📌 Get Transcription Text
export const getTranscriptionText = async (jobName) => {
  return axios.get(`${API_ROUTES.GET_TRANSCRIPTION_TEXT}?jobName=${jobName}`);
};

// 📌 Summarize Transcription
export const summarizeText = async (jobName) => {
  return axios.post(API_ROUTES.SUMMARIZE, { jobName });
};  
