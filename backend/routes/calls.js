const express = require("express");
const { getCalls, createCall } = require("../controllers/callController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateUser, getCalls);
router.post("/", authenticateUser, createCall);

module.exports = router;

