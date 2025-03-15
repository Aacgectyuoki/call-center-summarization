import React, { useState } from "react";
import { uploadFile, transcribeFile } from "../api";

const FileUploader = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return setMessage("Please select a file");
  
    try {
      setMessage("Uploading...");
      await onFileUpload(file); // Pass entire file
      setMessage("File uploaded successfully!");
    } catch (error) {
      setMessage("Upload failed!");
    }
  };  

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Upload
      </button>
      {message && <p className="mt-2 text-gray-700">{message}</p>}
    </div>
  );
};

export default FileUploader;
