const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const { transcribeAudio } = require("../utils/transcribeUtils");
const Transcription = require("../models/Transcription");

exports.extractAudioFromVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No video file uploaded" });
        }

        const videoPath = req.file.path;
        const audioPath = videoPath.replace(".mp4", ".mp3");

        // Convert video to audio
        ffmpeg(videoPath)
            .toFormat("mp3")
            .on("end", async () => {
                fs.unlinkSync(videoPath); // Remove video file after conversion
                
                // Transcribe the extracted audio
                const transcriptionText = await transcribeAudio(audioPath);

                // Save transcription in MongoDB
                const transcription = new Transcription({
                    audioFile: path.basename(audioPath),
                    transcription: transcriptionText,
                    createdAt: new Date()
                });

                await transcription.save();

                res.status(200).json({ message: "Audio extracted and transcribed", transcription });
            })
            .on("error", (error) => {
                res.status(500).json({ message: "Error processing video", error });
            })
            .save(audioPath);

    } catch (error) {
        res.status(500).json({ message: "Error extracting audio from video", error });
    }
};
