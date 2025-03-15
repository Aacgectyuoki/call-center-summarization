const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const { connectDB } = require("./config/db");
const timerMiddleware = require("./middleware/timerMiddleware");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Reorder)
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging Middleware (Moved ABOVE routes)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Place logging middleware BEFORE routes
app.use(timerMiddleware);

// Import Routes
const callRoutes = require("./routes/calls");
const summaryRoutes = require("./routes/summaries");
const transcriptionRoutes = require("./routes/transcriptions");
const videoRoutes = require("./routes/video");
const awsRoutes = require("./routes/awsRoutes");
const awsS3Routes = require("./routes/awsS3");

// Use Routes
app.use("/api/calls", callRoutes);
app.use("/api/summaries", summaryRoutes);
app.use("/api/aws", transcriptionRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/aws", awsRoutes);
app.use("/api/aws", awsS3Routes);
app.use("/uploads", express.static("uploads"));

// Error Handling Middleware (Optional)
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Test if server is running
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// app.use((req, res, next) => {
//   console.log(`[${req.method}] ${req.url}`);
//   next();
// });
