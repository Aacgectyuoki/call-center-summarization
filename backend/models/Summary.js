const mongoose = require("mongoose");

const SummarySchema = new mongoose.Schema(
  {
    transcription: { type: mongoose.Schema.Types.ObjectId, ref: "Transcription", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    summaryText: { type: String, required: true },
    bulletPoints: [{ type: String }], // Optional bullet-point summary
    sentiment: { type: String, enum: ["positive", "neutral", "negative"], default: "neutral" },
    complexity: { type: String, enum: ["concise", "regular", "simplified"], default: "regular" },
    createdAt: { type: Date, default: Date.now },
    processingTime: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Summary", SummarySchema);
