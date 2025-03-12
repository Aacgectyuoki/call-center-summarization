const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const { transcribeAudio } = require("../utils/transcribeUtils");
const Transcription = require("../models/Transcription");

// Download YouTube Audio and Transcribe
exports.transcribeYouTube = async (req, res) => {
    try {
        const { videoUrl } = req.body;

        if (!ytdl.validateURL(videoUrl)) {
            return res.status(400).json({ message: "Invalid YouTube URL" });
        }

        const videoId = ytdl.getURLVideoID(videoUrl);
        const audioFilePath = path.join(__dirname, `../uploads/${videoId}.mp3`);

        const audioStream = ytdl(videoUrl, { quality: "highestaudio" });
        const writeStream = fs.createWriteStream(audioFilePath);
        audioStream.pipe(writeStream);

        writeStream.on("finish", async () => {
            // Transcribe the audio
            const transcriptionText = await transcribeAudio(audioFilePath);
            
            // Save transcription in MongoDB
            const transcription = new Transcription({
                audioFile: videoId + ".mp3",
                transcription: transcriptionText,
                createdAt: new Date()
            });

            await transcription.save();

            res.status(200).json({ message: "Transcription completed", transcription });
        });

    } catch (error) {
        res.status(500).json({ message: "Error processing YouTube transcription", error });
    }
};
