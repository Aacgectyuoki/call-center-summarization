// const mongoose = require("mongoose");

// const TranscriptionSchema = new mongoose.Schema({
//     audioFile: { type: String, required: true }, // Path to the uploaded audio file
//     transcription: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//     processingTime: { type: Number, default: 0 } // Add this field
// });

// module.exports = mongoose.model("Transcription", TranscriptionSchema);

const mongoose = require("mongoose");

const transcriptionSchema = new mongoose.Schema({
    jobId: String, 
    originalFileName: String,
    s3FileName: String,
    transcriptionStatus: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transcription", transcriptionSchema);
