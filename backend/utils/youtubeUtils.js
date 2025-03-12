const ytdl = require("ytdl-core");
const { Writable } = require("stream");
const { pipeline } = require("stream");
const util = require("util");
const fs = require("fs");


const pipelinePromise = util.promisify(pipeline);

/**
 * Downloads audio from a YouTube video.
 * @param {string} videoUrl - The URL of the YouTube video.
 * @param {string} outputPath - The path where the audio file will be saved.
 * @returns {Promise<string>} - A promise that resolves with the output path when the download is complete.
 */
const downloadYouTubeAudio = async (videoUrl, outputPath) => {
    try {
        const audioStream = ytdl(videoUrl, { filter: 'audioonly' });
        const writeStream = new Writable({
            write(chunk, encoding, callback) {
                fs.appendFile(outputPath, chunk, callback);
            }
        });

        await pipelinePromise(audioStream, writeStream);

        console.log(`✅ Download complete: ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error("❌ YouTube audio download failed:", error);
        throw error;
    }
};

module.exports = {
    downloadYouTubeAudio
};