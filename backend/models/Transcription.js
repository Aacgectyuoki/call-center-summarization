// const mongoose = require("mongoose");

// const TranscriptionSchema = new mongoose.Schema(
//   {
//     file: { type: mongoose.Schema.Types.ObjectId, ref: "File", required: true },
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     text: { type: String, required: true },
//     language: { type: String, default: "en" },
//     status: { type: String, enum: ["pending", "completed"], default: "pending" },
//     createdAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Transcription", TranscriptionSchema);
const mongoose = require("mongoose");

const TranscriptionSchema = new mongoose.Schema({
  audioFile: { type: String, required: true },
  transcription: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transcription", TranscriptionSchema);
