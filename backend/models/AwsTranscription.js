const mongoose = require("mongoose");

const AwsTranscriptionSchema = new mongoose.Schema({
  jobId: String,
  status: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AwsTranscription", AwsTranscriptionSchema);