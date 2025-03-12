const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

/**
 * Downloads audio from a YouTube video.
 */
const downloadYouTubeAudio = async (videoUrl, outputPath) => {
    try {
        const stream = ytdl(videoUrl, { filter: "audioonly", quality: "highestaudio" });
        const writeStream = fs.createWriteStream(outputPath);

        stream.pipe(writeStream);
        
        return new Promise((resolve, reject) => {
            writeStream.on("finish", () => resolve(outputPath));
            writeStream.on("error", (error) => reject(error));
        });
    } catch (error) {
        console.error("YouTube audio download failed:", error);
        throw error;
    }
};

module.exports = {
    downloadYouTubeAudio
};
