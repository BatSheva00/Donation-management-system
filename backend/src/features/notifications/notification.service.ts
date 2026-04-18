import { Notification, INotification } from "./notification.model";
import { io } from "../../server";
import { logger } from "../../config/logger";
import mongoose from "mongoose";
import { User } from "../users/user.model";
import { Role } from "../roles/role.model";

interface CreateNotificationDto {
  userId: string | mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Create and send a notification
 */
export const createNotification = async (
  dto: CreateNotificationDto
): Promise<INotification> => {
  const notification = await Notification.create({
    userId: dto.userId,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    data: dto.data || {},
    isRead: false,
  });

  // Send via WebSocket to the user
  io.to(`user:${dto.userId.toString()}`).emit("notification", {
    id: notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    isRead: false,
    createdAt: notification.createdAt,
  });

  logger.debug(
    `Notification created and sent for user ${dto.userId}:`,
    dto.type
  );

  return notification;
};

/**
 * Create and send notifications to multiple users
 */
export const createNotifications = async (
  notifications: CreateNotificationDto[]
): Promise<void> => {
  const notificationsToCreate = notifications.map((dto) => ({
    userId: dto.userId,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    data: dto.data || {},
    isRead: false,
  }));

  const created = await Notification.insertMany(notificationsToCreate);

  // Send via WebSocket to each user
  created.forEach((notif) => {
    io.to(`user:${notif.userId.toString()}`).emit("notification", {
      id: notif._id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      data: notif.data,
      isRead: false,
      createdAt: notif.createdAt,
    });
  });

  logger.debug(`${created.length} notifications created and sent`);
};

/**
 * Helper: Send notification to a single user
 */
export const sendNotificationToUser = async (
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
) => {
  await createNotification({
    userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
  });
};

/**
 * Helper: Send notification to multiple users
 */
export const sendNotificationToUsers = async (
  userIds: string[],
  notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
) => {
  const notifications = userIds.map((userId) => ({
    userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
  }));

  await createNotifications(notifications);
};

/**
 * Helper: Send notification to all users with a specific role
 */
export const sendNotificationToRole = async (
  roleKey: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
) => {
  try {
    // Find the role by key
    const role = await Role.findOne({ key: roleKey });
    if (!role) {
      logger.error(`Role ${roleKey} not found`);
      return;
    }

    // Find all users with this role
    const users = await User.find({ role: role._id }).select("_id");
    const userIds = users.map((user) => user._id.toString());

    if (userIds.length === 0) {
      logger.warn(`No users found with role ${roleKey}`);
      return;
    }

    // Send notifications to all users
    await sendNotificationToUsers(userIds, notification);

    logger.debug(
      `Notification sent to ${userIds.length} users with role ${roleKey}`
    );
  } catch (error) {
    logger.error(`Error sending notification to role ${roleKey}:`, error);
  }
};
