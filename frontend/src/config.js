export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const API_ROUTES = {
  UPLOAD: `${API_BASE_URL}/api/aws/upload`,
  TRANSCRIBE: `${API_BASE_URL}/api/aws/transcribe`,
  CHECK_STATUS: `${API_BASE_URL}/api/aws/transcription-status`,
  // Use the S3 file URL route instead of transcription-text
  GET_S3_FILE_URL: `${API_BASE_URL}/api/aws/s3-file-url`,
  SUMMARIZE: `${API_BASE_URL}/api/aws/summarize`,
};
