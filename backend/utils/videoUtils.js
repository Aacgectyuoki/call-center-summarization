const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

/**
 * Extracts audio from a video file.
 */
const extractAudioFromVideo = (videoPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .output(outputPath)
            .audioCodec("libmp3lame")
            .on("end", () => resolve(outputPath))
            .on("error", (error) => reject(error))
            .run();
    });
};

module.exports = {
    extractAudioFromVideo
};
