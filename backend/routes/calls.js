const express = require('express');
const router = express.Router();
const { getCalls, createCall } = require('../controllers/callController');

router.get('/', getCalls);
router.post('/', createCall);

module.exports = router;
