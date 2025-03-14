const express = require("express");
const { triggerLambdaTranscription } = require("../utils/awsLambdaUtils"); 

const router = express.Router();

router.post("/invoke", triggerLambdaTranscription);

module.exports = router;