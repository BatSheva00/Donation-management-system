import { Activity, ActivityType } from "./activity.model";
import { logger } from "../../config/logger";

interface CreateActivityParams {
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Create a new activity record
 */
export const createActivity = async (params: CreateActivityParams) => {
  try {
    const activity = await Activity.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      description: params.description,
      metadata: params.metadata || {},
    });

    logger.info(`Activity created: ${params.type} for user ${params.userId}`);
    return activity;
  } catch (error) {
    logger.error("Error creating activity:", error);
    // Don't throw - activity tracking shouldn't break the main flow
    return null;
  }
};

/**
 * Get activities for a specific user
 */
export const getUserActivities = async (
  userId: string,
  limit: number = 20,
  skip: number = 0
) => {
  try {
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Activity.countDocuments({ userId });

    return { activities, total };
  } catch (error) {
    logger.error("Error fetching user activities:", error);
    throw error;
  }
};

/**
 * Get all activities (admin only) with filters
 */
export const getAllActivities = async (filters: {
  userId?: string;
  type?: ActivityType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}) => {
  try {
    const query: any = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.type) query.type = filters.type;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const limit = filters.limit || 50;
    const skip = filters.skip || 0;

    const activities = await Activity.find(query)
      .populate("userId", "firstName lastName email role")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Activity.countDocuments(query);

    return { activities, total };
  } catch (error) {
    logger.error("Error fetching all activities:", error);
    throw error;
  }
};

/**
 * Get recent activities (for dashboard)
 */
export const getRecentActivities = async (userId: string, limit: number = 10) => {
  try {
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return activities;
  } catch (error) {
    logger.error("Error fetching recent activities:", error);
    return [];
  }
};

/**
 * Delete old activities (cleanup task)
 */
export const deleteOldActivities = async (daysOld: number = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Activity.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    logger.info(`Deleted ${result.deletedCount} old activities`);
    return result.deletedCount;
  } catch (error) {
    logger.error("Error deleting old activities:", error);
    return 0;
  }
};


