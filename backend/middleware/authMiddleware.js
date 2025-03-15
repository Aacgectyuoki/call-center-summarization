const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authenticate User Middleware
// exports.authenticateUser = async (req, res, next) => {
//     const token = req.header("Authorization")?.split(" ")[1];

//     if (!token) {
//         return res.status(401).json({ message: "Access Denied. No token provided." });
//     }

//     try {
//         const secret = process.env.JWT_SECRET;
//         if (!secret) {
//             return res.status(500).json({ message: "JWT secret is not defined" });
//         }
//         const decoded = jwt.verify(token, secret);
//         if (typeof decoded !== 'string' && decoded.id) {
//             req.user = await User.findById(decoded.id).select("-password");
//         } else {
//             return res.status(401).json({ message: "Invalid Token" });
//         }
//         if (!req.user) {
//             return res.status(401).json({ message: "User not found" });
//         }
//         next();
//     } catch (error) {
//         res.status(401).json({ message: "Invalid Token" });
//     }
// };

// Authenticate User Middleware
exports.authenticateUser = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1] || process.env.JWT_TOKEN; // Get token from header or .env

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token available." });
    }

    try {
        const decoded = jwt.decode(token); // Decode the token without verifying
        req.user = decoded; // Store user info in req.user
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
    }
};

// Role-Based Access Middleware
exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: You do not have permission" });
        }
        next();
    };
};
