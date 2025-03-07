const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ["audio", "video", "text"],
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isCall: {
    type: Boolean,
    default: false, // Indicates whether this file is a call recording
  },
  callMetadata: {
    callDuration: Number,
    participants: [String], // Optional, list of speakers
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", FileSchema);


// const mongoose = require("mongoose");

// const FileSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     filename: { type: String, required: true },
//     fileType: { type: String, enum: ["audio", "video", "text"], required: true },
//     fileUrl: { type: String, required: true }, // URL or path where the file is stored
//     status: { type: String, enum: ["pending", "processed"], default: "pending" },
//     createdAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("File", FileSchema);
