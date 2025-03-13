const express = require("express");
const { invokeLambda } = require("../controllers/awsLambdaController");

const router = express.Router();

router.post("/invoke", invokeLambda);

module.exports = router;