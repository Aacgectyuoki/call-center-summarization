const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    transcription: { type: mongoose.Schema.Types.ObjectId, ref: 'Transcription' },
    status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED'], default: 'PENDING' },
}, { timestamps: true });

module.exports = mongoose.model('Video', VideoSchema);


