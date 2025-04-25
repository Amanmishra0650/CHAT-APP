import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { initSocket } from "./lib/socket.js";

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();
const { server } = initSocket(app);

// Set timeout for all requests to 30 seconds
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  res.setTimeout(30000); // 30 seconds
  next();
});

// Increase JSON payload limit and add error handling
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Configure CORS to be more permissive in development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Add a health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Add routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Start the server
server.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
  
  // Try to connect to MongoDB but don't stop the server if it fails
  connectDB().then(connected => {
    if (!connected) {
      console.log("Failed to connect to MongoDB, but server will continue running");
      console.log("Some features that require database may not work");
    }
  }).catch(err => {
    console.log("Failed to connect to MongoDB, but server will continue running");
    console.log("Some features that require database may not work");
  });
});
