// File: components/FileUploader.jsx
import React from "react";

const FileUploader = ({ setFile, setError }) => {
    const handleChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);
    };

    return (
        <div>
            <input type="file" onChange={handleChange} />
        </div>
    );
};

export default FileUploader;
