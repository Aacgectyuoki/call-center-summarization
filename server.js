const express = require("express");
const connectDB = require("./config/db"); // Import DB connection
require("dotenv").config();

const app = express();
app.use(express.json()); // Middleware for JSON handling

// Connect to MongoDB
connectDB();

// Import Routes
const callsRoutes = require("./routes/calls");
const summariesRoutes = require("./routes/summaries");

app.use("/api/calls", callsRoutes);
app.use("/api/summaries", summariesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));