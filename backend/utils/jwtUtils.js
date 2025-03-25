const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || "defaultSecretKey"; // Use .env variable or a default
    return jwt.sign({ id: userId }, secret);
};

module.exports = generateToken;
