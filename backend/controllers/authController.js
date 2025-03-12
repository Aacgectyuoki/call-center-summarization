const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const generateAccessToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user) => {
    if (!process.env.REFRESH_SECRET) {
        throw new Error("REFRESH_SECRET is not defined");
    }
    return jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
};

// User Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });

        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Refresh Token Endpoint
exports.refreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(403).json({ message: "No refresh token provided" });

    const refreshSecret = process.env.REFRESH_SECRET;
    if (!refreshSecret) return res.status(500).json({ message: "REFRESH_SECRET is not defined" });

    jwt.verify(refreshToken, refreshSecret, async (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid refresh token" });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(403).json({ message: "User not found" });

        const newAccessToken = generateAccessToken(user);
        res.json({ accessToken: newAccessToken });
    });
};
