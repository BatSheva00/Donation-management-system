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
import { apiLimiter } from "./shared/middleware/rateLimit.middleware";
import { handleStripeWebhook } from "./features/payments/payment.controller";
import {
  isEmailConfigured,
} from "./services/email.service";
import { isCloudinaryConfigured } from "./services/storage.service";

const app = express();
app.set("trust proxy", 1);
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
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.get("/", (_req, res) => {
  const frontend = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
  res.status(200).json({
    success: true,
    service: "KindLoop API",
    health: "/health",
    api: "/api",
    app: frontend || undefined,
  });
});

app.get("/health", (req, res) => {
  const production = process.env.NODE_ENV === "production";
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    mail: isEmailConfigured(),
    httpsMail: Boolean(
      process.env.RESEND_API_KEY?.trim() ||
        process.env.BREVO_API_KEY?.trim() ||
        process.env.MAIL_WEBHOOK_URL?.trim()
    ),
    uploads: production ? isCloudinaryConfigured() : true,
    stripe: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
    ai: Boolean(process.env.AI_MICROSERVICE_URL?.trim()),
  });
});

app.use(
  "/uploads/profile-images",
  cors({
    origin: getCorsOriginOption(),
    credentials: true,
  }),
  express.static(path.join(process.cwd(), "uploads/profile-images"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use("/api", (req, res, next) => {
  if (req.path === "/payments/webhook") {
    return next();
  }
  return apiLimiter(req, res, next);
});
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

    server.listen(Number(PORT), "0.0.0.0", () => {
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
