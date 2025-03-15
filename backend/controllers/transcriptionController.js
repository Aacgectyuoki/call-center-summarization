const Transcription = require("../models/Transcription");
const { startTranscription } = require("../utils/awsTranscribeUtils");

// const transcribeAudio = async (req, res) => {
//     try {
//         const { audioUrl } = req.body; // Get S3 audio file URL from request
//         if (!audioUrl) {
//             return res.status(400).json({ error: "Audio file URL is required" });
//         }

//         const jobName = `transcription-${Date.now()}`;
//         const response = await startTranscription(audioUrl, jobName);
//         res.json(response);
//     } catch (error) {
//         res.status(500).json({ error: "Transcription failed" });
//     }
// };

exports.transcribeAudio = async (req, res) => {
    try {
        const { audioUrl } = req.body;
        if (!audioUrl) {
            return res.status(400).json({ message: "Audio URL is required" });
        }

        // Extract filename from S3 URL
        const fileName = audioUrl.split("/").pop();
        const jobName = `transcription-${Date.now()}`;

        // Store transcription details in MongoDB before starting
        const newTranscription = new Transcription({
            jobId: jobName,
            originalFileName: fileName,
            s3FileName: audioUrl, // Store full S3 path
            transcriptionStatus: "pending"
        });

        await newTranscription.save();

        // Start transcription
        const response = await startTranscription(audioUrl, jobName);

        res.status(200).json({
            message: "Transcription job started",
            jobName,
            response
        });
    } catch (error) {
        console.error("Transcription Error:", error);
        res.status(500).json({ message: "Failed to start transcription", error: error.message });
    }
};


// const transcribeAudio = async (req, res) => {
//     try {
//         const { audioUrl } = req.body;
//         if (!audioUrl) {
//             return res.status(400).json({ error: "Audio file URL is required" });
//         }

//         const jobName = await startTranscription(audioUrl);
//         const transcriptUrl = await pollTranscriptionJob(jobName);

//         res.json({ message: "Transcription completed", jobName, transcriptUrl });
//     } catch (error) {
//         console.error("❌ Transcription failed:", error);
//         res.status(500).json({ error: "Transcription failed" });
//     }
// };

// const getTranscription = async (req, res) => {
//     try {
//         const transcriptionId = req.params.id;

//         if (!transcriptionId) {
//             return res.status(400).json({ error: "No transcription ID provided" });
//         }

//         // Fetch transcription from database (MongoDB)
//         const transcription = await Transcription.findById(transcriptionId);
//         if (!transcription) {
//             return res.status(404).json({ error: "Transcription not found" });
//         }

//         res.json(transcription);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch transcription" });
//     }
// };

// module.exports = { transcribeAudio };
    // , getTranscription };