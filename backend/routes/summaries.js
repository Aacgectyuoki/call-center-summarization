const express = require("express");
const { generateSummary } = require("../controllers/summaryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate", authMiddleware, generateSummary);

module.exports = router;
