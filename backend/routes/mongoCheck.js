const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// Define the collection name you want to check
const COLLECTION_NAME = "yourCollectionName"; // Replace with your actual collection name

// Endpoint to check MongoDB connection and list all documents
router.get("/mongo-check", async (req, res) => {
    try {
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ success: false, message: "Failed to connect to MongoDB" 
});
        }

        // List all documents in the specified collection
        const documents = await mongoose.connection.db.collection(COLLECTION_NAME).find().toArray();

        res.status(200).json({
            success: true,
            message: "Connected to MongoDB and retrieved documents successfully",
            documents
        });
    } catch (error) {
        console.error("MongoDB check error:", error);
        res.status(500).json({ success: false, message: "Error checking MongoDB connection", error: 
error.message });
    }
});

module.exports = router;
