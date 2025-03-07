const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected...");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Stop server on connection failure
  }
};

// Listen for MongoDB connection events
mongoose.connection.on("disconnected", () => console.log("❗ MongoDB Disconnected!"));
mongoose.connection.on("reconnected", () => console.log("🔄 MongoDB Reconnected!"));

module.exports = connectDB;
