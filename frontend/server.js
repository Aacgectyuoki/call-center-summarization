// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const { connectDB } = require("./config/db");

// // Load environment variables
// dotenv.config();

// // Connect to MongoDB
// connectDB();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ Allow CORS (Frontend: React runs on port 3000)
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// // Middleware
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Logging Middleware (MUST be before routes)
// app.use((req, res, next) => {
//     console.log(`[${req.method}] ${req.url}`);
//     next();
// });

// // Import Routes
// const transcriptionRoutes = require("./routes/transcriptions");
// const awsTranscribeRoutes = require("./routes/awsTranscribe");

// app.use("/api/aws", transcriptionRoutes);
// app.use("/api/aws", awsTranscribeRoutes);

// // Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error("Server Error:", err);
//   res.status(500).json({ message: "Internal Server Error" });
// });

// // Start Server
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// // Test if server is running
// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Server is running" });
// });
