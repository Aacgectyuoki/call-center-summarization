const express = require('express');
const router = express.Router();
const { getSummaries, createSummary } = require('../controllers/summaryController');

router.get('/', getSummaries);
router.post('/', createSummary);

module.exports = router;
