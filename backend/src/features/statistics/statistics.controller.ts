/**
 * Statistics Controller
 * Provides endpoints for system and user statistics
 * Stats are tracked automatically via MongoDB change streams
 */

import { Request, Response } from "express";
import { SystemStats, UserStats, HelpedUser } from "./statistics.model";
import { User } from "../users/user.model";
import { Donation } from "../donations/donation.model";
import { Request as DonationRequest } from "../requests/request.model";
import { Role } from "../roles/role.model";
import { logger } from "../../config/logger";

/**
 * Get system-wide statistics
 */
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    let stats = await SystemStats.findOne();

    // Initialize if not exists
    if (!stats) {
      stats = await initializeSystemStatsInternal();
    }

    res.json({
      success: true,
      data: {
        totalDonations: stats.totalDonations,
        totalRequests: stats.totalRequests,
        totalCompletedDonations: stats.totalCompletedDonations,
        uniqueUsersHelped: stats.uniqueUsersHelped,
        totalDrivers: stats.totalDrivers,
        totalBusinesses: stats.totalBusinesses,
        totalUsers: stats.totalUsers,
        lastUpdated: stats.lastUpdated,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error fetching system statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system statistics",
    });
  }
};

/**
 * Get statistics for the authenticated user
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    let stats = await UserStats.findOne({ userId });

    if (!stats) {
      // Initialize user stats from existing data
      stats = await initializeUserStatsInternal(userId);
    } else {
      // Reset monthly stats if month changed
      if (stats.currentMonth !== currentMonth) {
        stats.monthlyPeopleHelped = 0;
        stats.monthlyDonations = 0;
        stats.monthlyDeliveries = 0;
        stats.monthlyHelpedUserIds = [];
        stats.currentMonth = currentMonth;
        await stats.save();
      }
    }

    res.json({
      success: true,
      data: {
        // All-time stats
        donationsCompleted: stats.donationsCompleted,
        totalDonationsMade: stats.totalDonationsMade,
        totalRequestsMade: stats.totalRequestsMade,
        totalDeliveries: stats.totalDeliveries,
        totalPeopleHelped: stats.totalPeopleHelped,
        // Monthly impact
        monthlyPeopleHelped: stats.monthlyPeopleHelped,
        monthlyDonations: stats.monthlyDonations,
        monthlyDeliveries: stats.monthlyDeliveries,
        currentMonth: stats.currentMonth,
        lastUpdated: stats.lastUpdated,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error fetching user statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
  }
};

/**
 * Get statistics for a specific user (admin only)
 */
export const getUserStatsById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    let stats = await UserStats.findOne({ userId });

    if (!stats) {
      stats = await initializeUserStatsInternal(userId);
    } else if (stats.currentMonth !== currentMonth) {
      stats.monthlyPeopleHelped = 0;
      stats.monthlyDonations = 0;
      stats.monthlyDeliveries = 0;
      stats.monthlyHelpedUserIds = [];
      stats.currentMonth = currentMonth;
      await stats.save();
    }

    res.json({
      success: true,
      data: {
        userId,
        donationsCompleted: stats.donationsCompleted,
        totalDonationsMade: stats.totalDonationsMade,
        totalRequestsMade: stats.totalRequestsMade,
        totalDeliveries: stats.totalDeliveries,
        totalPeopleHelped: stats.totalPeopleHelped,
        monthlyPeopleHelped: stats.monthlyPeopleHelped,
        monthlyDonations: stats.monthlyDonations,
        monthlyDeliveries: stats.monthlyDeliveries,
        currentMonth: stats.currentMonth,
        lastUpdated: stats.lastUpdated,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error fetching user statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
  }
};

/**
 * Initialize/recalculate all statistics (admin only)
 */
export const initializeStats = async (req: Request, res: Response) => {
  try {
    const stats = await initializeSystemStatsInternal();

    res.json({
      success: true,
      message: "Statistics initialized successfully",
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error initializing statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize statistics",
    });
  }
};

/**
 * Internal function to initialize system stats
 */
async function initializeSystemStatsInternal() {
  logger.info("📊 Initializing system statistics...");

  // Count drivers and businesses
  const driverRole = await Role.findOne({ key: "driver" });
  const businessRole = await Role.findOne({ key: "business" });

  const totalDrivers = driverRole
    ? await User.countDocuments({ role: driverRole._id, isEmailVerified: true })
    : 0;
  const totalBusinesses = businessRole
    ? await User.countDocuments({
        role: businessRole._id,
        isEmailVerified: true,
      })
    : 0;
  const totalUsers = await User.countDocuments({ isEmailVerified: true });

  // Count all donations
  const totalDonations = await Donation.countDocuments();

  // Count all requests
  const totalRequests = await DonationRequest.countDocuments();

  // Count completed donations
  const completedDonations = await Donation.countDocuments({
    status: { $in: ["completed", "delivered"] },
  });

  // Count fulfilled requests
  const fulfilledRequests = await DonationRequest.countDocuments({
    status: "fulfilled",
  });

  // Count unique users helped
  const helpedFromRequests = await DonationRequest.distinct("requesterId", {
    status: "fulfilled",
  });
  const helpedFromDonations = await Donation.distinct("requestedBy", {
    status: { $in: ["completed", "delivered"] },
    requestedBy: { $exists: true, $ne: null },
  });

  const uniqueHelpedSet = new Set([
    ...helpedFromRequests.map((id) => id.toString()),
    ...helpedFromDonations.map((id) => id.toString()),
  ]);

  // Update helped users tracking
  for (const userId of uniqueHelpedSet) {
    await HelpedUser.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: { firstHelpedAt: new Date() },
        $set: { lastHelpedAt: new Date() },
      },
      { upsert: true }
    );
  }

  const stats = await SystemStats.findOneAndUpdate(
    {},
    {
      totalDonations,
      totalRequests,
      totalCompletedDonations: completedDonations + fulfilledRequests,
      uniqueUsersHelped: uniqueHelpedSet.size,
      totalDrivers,
      totalBusinesses,
      totalUsers,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  logger.info("✅ System statistics initialized", {
    totalDonations: stats.totalDonations,
    totalRequests: stats.totalRequests,
    totalCompletedDonations: stats.totalCompletedDonations,
    uniqueUsersHelped: stats.uniqueUsersHelped,
    totalDrivers: stats.totalDrivers,
    totalBusinesses: stats.totalBusinesses,
    totalUsers: stats.totalUsers,
  });

  return stats;
}

/**
 * Internal function to initialize user stats
 */
async function initializeUserStatsInternal(userId: string) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthStart = new Date(currentMonth + "-01");

  // Count donations made by user
  const totalDonationsMade = await Donation.countDocuments({ donorId: userId });
  const donationsCompleted = await Donation.countDocuments({
    donorId: userId,
    status: { $in: ["completed", "delivered"] },
  });

  // Count requests made by user
  const totalRequestsMade = await DonationRequest.countDocuments({
    requesterId: userId,
  });

  // Count deliveries (for drivers)
  const totalDeliveries = await Donation.countDocuments({
    assignedDriverId: userId,
    status: { $in: ["completed", "delivered"] },
  });

  // Count unique people helped (as donor)
  const helpedUsers = await Donation.distinct("requestedBy", {
    donorId: userId,
    status: { $in: ["completed", "delivered"] },
    requestedBy: { $exists: true, $ne: null },
  });

  // Monthly donations
  const monthlyDonations = await Donation.countDocuments({
    donorId: userId,
    createdAt: { $gte: monthStart },
  });

  // Monthly deliveries
  const monthlyDeliveries = await Donation.countDocuments({
    assignedDriverId: userId,
    status: { $in: ["completed", "delivered"] },
    deliveredAt: { $gte: monthStart },
  });

  // Monthly people helped
  const monthlyHelpedUsers = await Donation.distinct("requestedBy", {
    donorId: userId,
    status: { $in: ["completed", "delivered"] },
    requestedBy: { $exists: true, $ne: null },
    deliveredAt: { $gte: monthStart },
  });

  const stats = await UserStats.findOneAndUpdate(
    { userId },
    {
      donationsCompleted,
      totalDonationsMade,
      totalRequestsMade,
      totalDeliveries,
      totalPeopleHelped: helpedUsers.length,
      monthlyPeopleHelped: monthlyHelpedUsers.length,
      monthlyDonations,
      monthlyDeliveries,
      currentMonth,
      helpedUserIds: helpedUsers,
      monthlyHelpedUserIds: monthlyHelpedUsers,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  return stats;
}
