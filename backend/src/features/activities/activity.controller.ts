import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/utils/AppError";
import {
  getUserActivities,
  getAllActivities,
  getRecentActivities,
} from "./activity.service";
import { ActivityType } from "./activity.model";

/**
 * Get current user's activities
 */
export const getMyActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const { activities, total } = await getUserActivities(
      userId,
      limitNum,
      skip
    );

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent activities for dashboard
 */
export const getRecentActivitiesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const { limit = 10 } = req.query;

    const limitNum = parseInt(limit as string);

    const activities = await getRecentActivities(userId, limitNum);

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all activities (Admin only)
 */
export const getAllActivitiesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      userId,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filters: any = {
      limit: limitNum,
      skip,
    };

    if (userId) filters.userId = userId as string;
    if (type) filters.type = type as ActivityType;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const { activities, total } = await getAllActivities(filters);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};


