const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Import Routes
const callRoutes = require("./routes/calls");
const summaryRoutes = require("./routes/summaries");
const transcriptionRoutes = require("./routes/transcriptions");

// Use Routes
app.use("/api/calls", callRoutes);
app.use("/api/summaries", summaryRoutes);
app.use("/api/transcriptions", transcriptionRoutes);
app.use("/uploads", express.static("uploads"));


// Error Handling Middleware (Optional)
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
