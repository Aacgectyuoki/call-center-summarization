export const API_BASE_URL = "http://localhost:5000/api";

export const API_ROUTES = {
  UPLOAD: `${API_BASE_URL}/aws/upload`,
  TRANSCRIBE: `${API_BASE_URL}/aws/transcribe`,
  CHECK_STATUS: `${API_BASE_URL}/aws/transcription-status`,
  GET_TRANSCRIPTION_TEXT: `${API_BASE_URL}/aws/transcription-text`,
  SUMMARIZE: `${API_BASE_URL}/aws/summarize`,
};
