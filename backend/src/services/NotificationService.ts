/**
 * Notification Service
 * Handles real-time notifications via Socket.IO without change streams
 */

import { Server as SocketServer } from "socket.io";
import { logger } from "../config/logger";

let io: SocketServer | null = null;

/**
 * Initialize the notification service with Socket.IO instance
 */
export const initializeNotificationService = (socketIO: SocketServer): void => {
  io = socketIO;
  logger.info("✅ Notification service initialized");
};

/**
 * Get the Socket.IO instance
 */
export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized. Call initializeNotificationService first."
    );
  }
  return io;
};

/**
 * Notify donation changes
 */
export const notifyDonationChange = (
  operationType: "insert" | "update" | "delete",
  donation: any
): void => {
  if (!io) return;

  try {
    // Notify donation owner
    if (donation.donorId) {
      const donorId =
        typeof donation.donorId === "object"
          ? donation.donorId._id?.toString()
          : donation.donorId.toString();
      io.to(`user:${donorId}`).emit("donation:update", {
        type: operationType,
        donation,
      });
    }

    // Notify users with donation permissions
    io.to("permission:donations.view").emit("donation:list:update", {
      type: operationType,
      donationId: donation._id,
    });

    logger.debug(
      `📢 Donation ${operationType} notification sent for ${donation._id}`
    );
  } catch (error) {
    logger.error("Error sending donation notification:", error);
  }
};

/**
 * Notify request changes
 */
export const notifyRequestChange = (
  operationType: "insert" | "update" | "delete",
  request: any
): void => {
  if (!io) return;

  try {
    // Notify request owner
    if (request.requestorId) {
      const requestorId =
        typeof request.requestorId === "object"
          ? request.requestorId._id?.toString()
          : request.requestorId.toString();
      io.to(`user:${requestorId}`).emit("request:update", {
        type: operationType,
        request,
      });
    }

    // Notify users with request permissions
    io.to("permission:requests.view").emit("request:list:update", {
      type: operationType,
      requestId: request._id,
    });

    logger.debug(
      `📢 Request ${operationType} notification sent for ${request._id}`
    );
  } catch (error) {
    logger.error("Error sending request notification:", error);
  }
};

/**
 * Notify transaction changes
 */
export const notifyTransactionChange = (
  operationType: "insert" | "update" | "delete",
  transaction: any
): void => {
  if (!io) return;

  try {
    // Notify user involved in transaction
    if (transaction.userId) {
      const userId =
        typeof transaction.userId === "object"
          ? transaction.userId._id?.toString()
          : transaction.userId.toString();
      io.to(`user:${userId}`).emit("transaction:update", {
        type: operationType,
        transaction,
      });
    }

    // Notify admins
    io.to("permission:system.admin").emit("transaction:list:update", {
      type: operationType,
      transactionId: transaction._id,
    });

    logger.debug(
      `📢 Transaction ${operationType} notification sent for ${transaction._id}`
    );
  } catch (error) {
    logger.error("Error sending transaction notification:", error);
  }
};

/**
 * Notify user changes
 */
export const notifyUserChange = (
  operationType: "insert" | "update" | "delete",
  user: any,
  userId?: string
): void => {
  if (!io) return;

  try {
    const userIdStr = user?._id?.toString() || userId;

    // Notify admins about user changes
    io.to("permission:users.manage").emit("user:list:update", {
      type: operationType,
      userId: userIdStr,
    });

    // Notify the user themselves if it's an update
    if (operationType === "update" && user) {
      io.to(`user:${userIdStr}`).emit("user:profile:update", {
        type: operationType,
        user,
      });
    }

    logger.debug(`📢 User ${operationType} notification sent`);
  } catch (error) {
    logger.error("Error sending user notification:", error);
  }
};

/**
 * Send notification to specific users
 */
export const sendToUsers = (
  userIds: string[],
  event: string,
  data: any
): void => {
  if (!io) return;

  try {
    userIds.forEach((userId) => {
      io!.to(`user:${userId}`).emit(event, data);
    });
    logger.debug(`📢 Sent ${event} to ${userIds.length} users`);
  } catch (error) {
    logger.error("Error sending notification to users:", error);
  }
};

/**
 * Send notification to users with specific permission
 */
export const sendToPermission = (
  permission: string,
  event: string,
  data: any
): void => {
  if (!io) return;

  try {
    io.to(`permission:${permission}`).emit(event, data);
    logger.debug(`📢 Sent ${event} to permission: ${permission}`);
  } catch (error) {
    logger.error("Error sending notification to permission:", error);
  }
};
