const { uploadFileToS3 } = require("../utils/awsS3Utils");
const { startTranscriptionJob } = require("./awsTranscribeController");

const uploadAudio = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: "No file uploaded" });

        const s3Url = await uploadFileToS3(file.buffer, file.originalname, file.mimetype);
        const transcriptionJobId = await startTranscriptionJob(s3Url);

        res.json({ message: "File uploaded and transcription started", transcriptionJobId });
    } catch (error) {
        console.error("S3 Upload Error:", error);
        res.status(500).json({ error: "Failed to upload file" });
    }
};

module.exports = { uploadAudio };