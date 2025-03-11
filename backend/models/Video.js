const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  duration: { type: Number, required: true }, // Duration in seconds
  fileSize: { type: Number }, // File size in bytes
  extractedAudio: { type: mongoose.Schema.Types.ObjectId, ref: "File" }, // Reference to extracted audio file
  processed: { type: Boolean, default: false }, // If video-to-audio conversion is done
}, { timestamps: true });

module.exports = mongoose.model("Video", VideoSchema);
