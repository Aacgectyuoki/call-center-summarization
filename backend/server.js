const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const { connectDB } = require("./config/db");
const timerMiddleware = require("./middleware/timerMiddleware");
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure DB is connected before starting the server
(async () => {
    try {
        await connectDB();  // 🔹 Ensures MongoDB is ready before server starts
        console.log("✅ MongoDB Connected...");

        // Middleware
        app.use(express.json());
        app.use(cors({
            origin: 'https://aacgectyuoki.github.io',
            credentials: true
          }));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        // Logging Middleware
        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*"); // Or be specific to your GitHub pages domain
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
            next();
          });
          
        // app.use((req, res, next) => {
        //     console.log(`[${req.method}] ${req.url}`);
        //     next();
        // });

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

        // Proxy S3 JSON file through backend to avoid CORS
        app.get('/api/aws/proxy-json', async (req, res) => {
            const { filename } = req.query;
            const s3Url = `https://dtsummarizr-audio1.s3.us-east-1.amazonaws.com/${filename}`;
            
            try {
            const response = await axios.get(s3Url);
            res.json(response.data); // Send the file content to the frontend
            } catch (err) {
            console.error("Proxy fetch failed:", err.message);
            res.status(500).json({ error: 'Failed to fetch from S3' });
            }
        });

        // Error Handling Middleware
        app.use((err, req, res, next) => {
            console.error("Server Error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        });

        // Start Server after DB Connection is Ready
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1); // Exit if DB connection fails
    }
})();
