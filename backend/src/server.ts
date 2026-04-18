import "./config/loadEnv";

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
import { getCorsOriginOption } from "./config/corsOrigins";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: getCorsOriginOption(),
    credentials: true,
  },
});

app.use(helmet());
app.use(
  cors({
    origin: getCorsOriginOption(),
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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(
  "/uploads/profile-images",
  cors({
    origin: getCorsOriginOption(),
    credentials: true,
  }),
  express.static(path.join(__dirname, "../uploads/profile-images"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use("/api", routes);

initializeSocketIO(io);
initializeNotificationService(io);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (
      !process.env.JWT_SECRET?.trim() ||
      !process.env.JWT_REFRESH_SECRET?.trim()
    ) {
      logger.error(
        "Set JWT_SECRET and JWT_REFRESH_SECRET in backend/.env (required for auth)."
      );
      process.exit(1);
    }

    await connectDB();

    await runSeeds();

    logger.info("✅ Notification service ready for real-time updates");

    server.listen(PORT, () => {
      logger.info(
        `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`
      );
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

process.removeAllListeners("unhandledRejection");
process.once("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
});

process.removeAllListeners("SIGTERM");
process.once("SIGTERM", async () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

export { io };
