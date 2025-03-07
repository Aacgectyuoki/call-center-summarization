const express = require("express");
const { uploadCall } = require("../controllers/callController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/upload", authMiddleware, uploadCall);

module.exports = router;
