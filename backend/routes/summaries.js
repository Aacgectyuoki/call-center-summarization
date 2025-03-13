const express = require('express');
const { generateSummary } = require('../controllers/summaryController');
const router = express.Router();

router.post('/', generateSummary);

module.exports = router;


// const express = require("express");
// const { getSummaries, createSummary } = require("../controllers/summaryController");
// const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

// const router = express.Router();

// router.get("/", authenticateUser, getSummaries); // Users can fetch their own summaries
// router.get("/admin", authenticateUser, authorizeRole(["Admin"]), getSummaries); // Admins fetch all summaries
// router.post("/", authenticateUser, createSummary); // Users can create summaries

// module.exports = router;
