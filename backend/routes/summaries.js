const express = require('express');
const { generateSummary } = require('../controllers/summaryController');
const router = express.Router();

router.post('/', generateSummary);

module.exports = router;
