const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { uploadFileToS3 } = require("../utils/awsS3Utils");
const { triggerLambdaTranscription } = require("../utils/awsLambdaUtils");
const { generateFileName } = require("../utils/fileHandler");

exports.extractAudioFromVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No video file uploaded" });
        }

        // Generate a unique and persistent file name based on user ID
        const userId = req.user ? req.user.id : "guest";
        const uniqueFileName = generateFileName(req.file.originalname, userId);
        const audioFileName = uniqueFileName.replace(".mp4", ".mp3");

        const videoPath = req.file.path;
        const audioPath = path.join("uploads", audioFileName);

        // Convert video to audio using FFmpeg
        ffmpeg(videoPath)
            .toFormat("mp3")
            .on("end", async () => {
                fs.unlinkSync(videoPath); // Remove video after conversion

                // Upload audio to S3
                const audioBuffer = fs.readFileSync(audioPath);
                const s3Url = await uploadFileToS3(audioBuffer, audioFileName, "audio/mpeg");

                // Trigger AWS Lambda to start transcription
                const lambdaResponse = await triggerLambdaTranscription(s3Url);

                // Remove audio file after uploading
                fs.unlinkSync(audioPath);

                res.status(200).json({
                    message: "Audio extracted, transcription started",
                    fileId: uniqueFileName, // ✅ Now fileId remains consistent
                    s3Url, // ✅ Persistent URL
                    lambdaResponse,
                });
            })
            .on("error", (error) => {
                console.error("Error converting video to audio:", error);
                res.status(500).json({ message: "Error processing video", error });
            })
            .save(audioPath);
    } catch (error) {
        console.error("Error extracting audio from video:", error);
        res.status(500).json({ message: "Error extracting audio from video", error });
    }
};