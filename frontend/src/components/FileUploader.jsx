import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "../styles/FileUploader.css"; // Ensure this file exists

const FileUploader = ({ setFile, setError }) => {
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const validFormats = ["mp3", "mp4"];
        const fileExtension = selectedFile.name.split(".").pop().toLowerCase();

        if (!validFormats.includes(fileExtension)) {
            setError("❌ Please select a valid MP3 or MP4 file.");
            return;
        }

        setError(""); // Clear error if file is valid
        setFile(selectedFile);
        console.log("📂 File selected:", selectedFile.name);
    };

    return (
        <div>
            <input type="file" id="fileInput" accept=".mp3,.mp4" onChange={handleFileChange} />
        </div>
    );
};

export default FileUploader;
