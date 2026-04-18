import { Request, Response, NextFunction } from "express";
import { Notification } from "./notification.model";
import { AppError } from "../../shared/utils/AppError";

/**
 * Get all notifications for the authenticated user
 */
export const getMyNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 20, isRead } = req.query;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = { userId };
    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent unread notifications
 */
export const getUnreadNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { limit = 10 } = req.query;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const notifications = await Notification.find({
      userId,
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .lean();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notifications as read
 */
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { notificationIds } = req.body;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return next(
        new AppError("notificationIds must be a non-empty array", 400)
      );
    }

    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId, // Ensure user can only mark their own notifications
        isRead: false, // Only update unread ones
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Notifications marked as read",
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const result = await Notification.updateMany(
      {
        userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId, // Ensure user can only delete their own notifications
    });

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all read notifications
 */
export const deleteAllRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const result = await Notification.deleteMany({
      userId,
      isRead: true,
    });

    res.status(200).json({
      success: true,
      message: "All read notifications deleted",
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
