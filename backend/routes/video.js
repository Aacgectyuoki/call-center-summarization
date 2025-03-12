const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Video = require("../models/Video");
const { extractAudioFromVideo } = require("../utils/videoUtils");

const router = express.Router();

// ✅ Ensure required directories exist
const UPLOAD_VIDEO_DIR = "uploads/videos/";
const UPLOAD_AUDIO_DIR = "uploads/audios/";

[UPLOAD_VIDEO_DIR, UPLOAD_AUDIO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// ✅ Configure Multer for Video Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_VIDEO_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// ✅ Route to Upload Video
router.post("/upload", upload.single("video"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No video file uploaded" });
        }

        // ✅ Save video metadata in MongoDB
        const video = new Video({
            filename: req.file.filename,
            filePath: req.file.path,
            fileSize: req.file.size,
            processed: false
        });

        await video.save();

        res.status(201).json({
            success: true,
            message: "Video uploaded successfully",
            video
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: "Error uploading video", error: error.message });
    }
});

// ✅ Route to Extract Audio from Video
router.post("/extract-audio/:videoId", async (req, res) => {
    try {
        const video = await Video.findById(req.params.videoId);
        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        const audioFilename = `${Date.now()}-${video.filename}.mp3`;
        const audioPath = path.join(UPLOAD_AUDIO_DIR, audioFilename);

        // ✅ Extract and Save Audio
        await extractAudioFromVideo(video.filePath, audioPath);

        // ✅ Store the audio file path in MongoDB
        video.processed = true;
        video.extractedAudio = audioPath; // ✅ Storing path instead of ObjectId
        await video.save();

        res.status(200).json({
            success: true,
            message: "Audio extracted successfully",
            audioPath
        });
    } catch (error) {
        console.error("Extraction error:", error);
        res.status(500).json({ success: false, message: "Error extracting audio from video", error: error.message });
    }
});

// ✅ Route to Fetch All Videos
router.get("/", async (req, res) => {
    try {
        const videos = await Video.find();
        res.status(200).json({ success: true, message: "Videos retrieved successfully", videos });
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ success: false, message: "Error retrieving videos", error: error.message });
    }
});

module.exports = router;
