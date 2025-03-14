const { exec } = require("child_process");
const path = require("path");
const { uploadFileToS3 } = require("../utils/awsS3Utils");
const { startTranscriptionJob } = require("../controllers/awsTranscribeController");

const downloadYouTubeAudio = async (url) => {
    return new Promise((resolve, reject) => {
        const outputFilePath = path.join(__dirname, "../downloads/audio.mp3");
        const command = `yt-dlp -x --audio-format mp3 -o "${outputFilePath}" ${url}`;

        exec(command, (error, stdout, stderr) => {
            if (error) return reject(error);
            console.log("YouTube audio downloaded:", stdout);
            resolve(outputFilePath);
        });
    });
};

const processYouTubeAudio = async (req, res) => {
    try {
        const { youtubeUrl } = req.body;
        if (!youtubeUrl) return res.status(400).json({ error: "YouTube URL is required" });

        const filePath = await downloadYouTubeAudio(youtubeUrl);
        const s3Url = await uploadFileToS3(filePath, "processed-audio");
        const transcriptionJobId = await startTranscriptionJob(s3Url);

        res.json({ message: "YouTube audio processing started", transcriptionJobId });
    } catch (error) {
        console.error("YouTube processing error:", error);
        res.status(500).json({ error: "Failed to process YouTube audio" });
    }
};

module.exports = { processYouTubeAudio };