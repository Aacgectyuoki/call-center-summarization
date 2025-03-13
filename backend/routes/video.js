const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getDB } = require("../config/db"); // Ensure MongoClient connection
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

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // ✅ Allow only video file types
        const allowedMimeTypes = ["video/mp4", "video/mkv", "video/avi", "video/webm"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

// ✅ Route to Upload Video
router.post("/upload", upload.single("video"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No video file uploaded" });
        }

        const db = getDB();
        const videoCollection = db.collection("videos");

        // ✅ Save video metadata in MongoDB
        const videoData = {
            filename: req.file.filename,
            filePath: req.file.path,
            fileSize: req.file.size,
            processed: false,
            uploadedAt: new Date()
        };

        const result = await videoCollection.insertOne(videoData);

        res.status(201).json({
            success: true,
            message: "Video uploaded successfully",
            video: result.insertedId
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: "Error uploading video", error: error.message });
    }
});

// ✅ Route to Fetch All Videos
router.get("/", async (req, res) => {
    try {
        const db = getDB();
        const videoCollection = db.collection("videos");

        const videos = await videoCollection.find().toArray();

        res.status(200).json({ success: true, message: "Videos retrieved successfully", videos });
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ success: false, message: "Error retrieving videos", error: error.message });
    }
});

module.exports = router;
