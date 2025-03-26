const { v4: uuidv4 } = require("uuid");
// const multer = require("multer");
const path = require("path");

// Function to generate a unique filename
const generateFileName = (originalName, userId = "guest") => {
    const fileExtension = originalName.split(".").pop();
    return `${userId}-${uuidv4()}.${fileExtension}`;
};

module.exports = { generateFileName };

// // Storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/");
//     },
//     filename: (req, file, cb) => {
//         // Use user ID if available
//         const userId = req.user ? req.user.id : "guest";
//         const uniqueFileName = generateFileName(file.originalname, userId);
//         cb(null, uniqueFileName);
//     }
// });

// // File filter for allowed formats
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = ["audio/mpeg", "audio/wav", "video/mp4"];
//     if (allowedTypes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         cb(new Error("Invalid file type. Only MP3, WAV, and MP4 are allowed."), false);
//     }
// };

// // Upload middleware
// const upload = multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
// });

// module.exports = { upload, generateFileName };