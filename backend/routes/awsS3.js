const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadAudio } = require("../controllers/awsS3Controller");

const upload = multer({ storage: multer.memoryStorage() });

// Upload file to AWS S3 and start transcription
router.post("/upload", upload.single("file"), uploadAudio);

module.exports = router;

// const express = require("express");
// const multer = require("multer");
// const { uploadFileToS3 } = require("../utils/awsS3Utils");

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// router.post("/upload", upload.single("file"), async (req, res) => {
//     try {
//         const file = req.file;
//         if (!file) return res.status(400).json({ error: "No file uploaded" });

//         const fileUrl = await uploadFileToS3(file.buffer, file.originalname, file.mimetype);
//         res.status(200).json({ message: "File uploaded successfully", fileUrl });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;
