const ytdl = require("ytdl-core");
const { Writable } = require("stream");
const { pipeline } = require("stream");
const util = require("util");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");



const pipelinePromise = util.promisify(pipeline);

/**
 * Downloads and converts YouTube audio to MP3.
 * @param {string} videoUrl - The URL of the YouTube video.
 * @param {string} outputDir - The directory to save the MP3 file.
 * @returns {Promise<string>} - Path to the saved MP3 file.
 */
const downloadYouTubeAudio = async (videoUrl, outputDir) => {
    return new Promise(async (resolve, reject) => {
        try {
            const videoId = ytdl.getURLVideoID(videoUrl);
            const outputPath = path.join(outputDir, `${videoId}.mp3`);
            const tempPath = path.join(outputDir, `${videoId}.mp4`);

            console.log(`Downloading audio from ${videoUrl}...`);
            const stream = ytdl(videoUrl, { filter: 'audioonly' });

            stream.pipe(fs.createWriteStream(tempPath));

            stream.on("end", () => {
                console.log("Converting to MP3...");
                exec(`ffmpeg -i "${tempPath}" -vn -acodec libmp3lame "${outputPath}"`, (err) => {
                    if (err) return reject(err);
                    fs.unlinkSync(tempPath); // Remove temp file
                    resolve(outputPath);
                });
            });

            stream.on("error", reject);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    downloadYouTubeAudio,
};