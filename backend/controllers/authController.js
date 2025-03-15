const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user in DB
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        // Validate password (assuming bcrypt is used)
        // const isMatch = await user.comparePassword(password);
        // if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Generate JWT WITHOUT expiration
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({ token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

