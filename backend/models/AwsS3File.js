const mongoose = require("mongoose");

const AwsS3FileSchema = new mongoose.Schema({
  fileName: String,
  fileUrl: String,
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AwsS3File", AwsS3FileSchema);