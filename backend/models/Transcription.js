const mongoose = require("mongoose");

const transcriptionSchema = new mongoose.Schema({
    jobId: String, 
    originalFileName: String,
    s3FileName: String,
    transcriptionStatus: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transcription", transcriptionSchema);
