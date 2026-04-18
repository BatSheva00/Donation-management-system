import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../../config/logger";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prevent sending response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
    return;
  }

  // MongoDB duplicate key error
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    logger.error("Duplicate key error:", err);
    res.status(400).json({
      success: false,
      message: "Duplicate entry. This record already exists.",
    });
    return;
  }

  // MongoDB validation error
  if (err.name === "ValidationError") {
    logger.error("Validation error:", err);
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.message,
    });
    return;
  }

  // Default error
  logger.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  });
};
