const Call = require("../models/Call");
const File = require("../models/File");

exports.uploadCall = async (req, res) => {
    try {
        const { filename, fileType, filePath, uploadedBy } = req.body;
        const file = new File({ filename, fileType, filePath, uploadedBy, isCall: true });

        await file.save();
        res.status(201).json({ message: "Call uploaded successfully", file });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
