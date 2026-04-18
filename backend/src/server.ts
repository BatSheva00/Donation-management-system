// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import path from "path";
import { connectDB } from "./config/database";
import { logger } from "./config/logger";
import { errorHandler } from "./shared/middleware/error.middleware";
import { notFound } from "./shared/middleware/notFound.middleware";
import routes from "./routes";
import { initializeSocketIO } from "./config/socket";
import { runSeeds } from "./config/seedPermissions";
import { initializeNotificationService } from "./services/NotificationService";
import mongoose from "mongoose";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Serve profile images publicly (no auth required) with CORS
app.use(
  "/uploads/profile-images",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
  express.static(path.join(__dirname, "../uploads/profile-images"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Note: Other uploads are protected via API routes for security

// API Routes
app.use("/api", routes);

// Initialize Socket.IO
initializeSocketIO(io);

// Initialize Notification Service with Socket.IO
initializeNotificationService(io);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info("📦 Database connected successfully");

    // Seed permissions and roles
    await runSeeds();

    logger.info("✅ Notification service ready for real-time updates");

    // Start listening
    server.listen(PORT, () => {
      logger.info(
        `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
// Use 'once' to prevent multiple listeners in dev mode (nodemon restarts)
process.removeAllListeners("unhandledRejection");
process.once("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  // Don't crash the server - just log it
  // In production, you might want to alert/monitor this
});

// Graceful shutdown
// Use 'once' to prevent multiple listeners in dev mode (nodemon restarts)
process.removeAllListeners("SIGTERM");
process.once("SIGTERM", async () => {
  logger.info("SIGTERM signal received: closing HTTP server");

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

export { io };
