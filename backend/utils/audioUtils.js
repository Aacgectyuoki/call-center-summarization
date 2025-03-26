const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

/**
 * Get audio duration using FFmpeg
 */
const getAudioDuration = (filePath) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File does not exist: ${filePath}`);
            return reject(new Error(`File does not exist: ${filePath}`));
        }

        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata.format.duration); // ✅ Returns duration in seconds
            }
        });
    });
};

module.exports = getAudioDuration;
