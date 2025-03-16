import { useState } from "react";
import axios from "axios";
import React from "react";

const FileUploader = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setUploadStatus("No file selected!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            setUploadStatus("Uploading...");

            const response = await axios.post(
                "http://localhost:5000/api/aws/upload",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            console.log("Upload Response:", response.data);
            setUploadStatus("Upload successful!");

            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }
        } catch (error) {
            console.error("Upload Error:", error);
            setUploadStatus("Upload failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-md mx-auto text-center">
            <h2 className="text-xl font-bold text-gray-800">Upload an Audio File</h2>
            <input 
                type="file" 
                onChange={handleFileChange} 
                className="mt-3 border border-gray-300 p-2 rounded w-full"
            />
            <button
                onClick={handleUpload}
                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded w-full"
                disabled={loading}
            >
                {loading ? "Uploading..." : "Upload"}
            </button>
            {uploadStatus && <p className="mt-3 text-gray-600">{uploadStatus}</p>}
        </div>
    );
};

export default FileUploader;