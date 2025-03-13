const express = require("express");
const router = express.Router();
const { upload, uploadFileToS3 } = require("../controllers/awsS3Controller");
// const awsS3Controller = require("../controllers/awsS3Controller"); // Ensure this path is correct
// const multer = require("multer");

// const upload = multer({ storage: multer.memoryStorage() }); // Multer setup

// // ✅ Route to upload a file to S3
// router.post("/upload", upload.single("file"), awsS3Controller.uploadFile);

// Upload file to AWS S3
router.post("/upload", upload.single("file"), uploadFileToS3);

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
