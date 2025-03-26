const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { uploadFileToS3 } = require("./awsS3Utils"); // Ensure this exists

/**
 * Converts an MP4 video to MP3 audio using FFmpeg.
 * Stores files based on user selection (keep video or delete it).
 *
 * @param {string} inputFilePath - Path to the input MP4 video.
 * @param {string} userPreference - "video-audio" (keep both) or "audio-only".
 * @returns {Promise<{ audioUrl: string, videoUrl?: string }>} - URLs of saved files.
 */
async function convertVideoToAudio(inputFilePath, userPreference = "video-audio") {
    return new Promise((resolve, reject) => {
        const outputAudioPath = inputFilePath.replace(".mp4", ".mp3");

        // Run FFmpeg to extract audio
        const command = `ffmpeg -i "${inputFilePath}" -vn -acodec libmp3lame -q:a 3 "${outputAudioPath}"`;

        exec(command, async (error) => {
            if (error) {
                return reject(`FFmpeg conversion failed: ${error.message}`);
            }

            try {
                // Upload extracted audio to S3
                const audioUrl = await uploadFileToS3(outputAudioPath, "processed-audio/");

                let videoUrl;
                if (userPreference === "video-audio") {
                    // Upload video only if the user wants both
                    videoUrl = await uploadFileToS3(inputFilePath, "raw-videos/");
                }

                // Cleanup temporary files after upload
                fs.unlinkSync(outputAudioPath);
                if (userPreference === "audio-only") {
                    fs.unlinkSync(inputFilePath); // Delete video if not needed
                }

                resolve({ audioUrl, videoUrl });
            } catch (uploadError) {
                reject(`File upload failed: ${uploadError.message}`);
            }
        });
    });
}

module.exports = { convertVideoToAudio };
