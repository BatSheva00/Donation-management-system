/**
 * Statistics Service
 * Handles statistics updates directly without change streams
 */

import { logger } from "../config/logger";
import {
  SystemStats,
  UserStats,
} from "../features/statistics/statistics.model";
import { Donation } from "../features/donations/donation.model";
import { Request } from "../features/requests/request.model";

/**
 * Update system stats on donation insert
 */
export const onDonationInsert = async (donation: any): Promise<void> => {
  try {
    // Update system stats
    await SystemStats.findOneAndUpdate(
      {},
      {
        $inc: {
          totalDonations: 1,
        },
      },
      { upsert: true }
    );

    // Update user stats for donor
    const donorId =
      typeof donation.donorId === "object"
        ? donation.donorId._id?.toString()
        : donation.donorId.toString();
    
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const userStats = await UserStats.findOne({ userId: donorId });

    if (!userStats || userStats.currentMonth !== currentMonth) {
      // New month or first donation - reset monthly stats
      await UserStats.findOneAndUpdate(
        { userId: donorId },
        {
          $inc: { totalDonationsMade: 1 },
          $set: {
            monthlyDonations: 1,
            currentMonth: currentMonth,
            lastUpdated: new Date(),
          },
        },
        { upsert: true }
      );
    } else {
      // Same month - increment both counters
      await UserStats.findOneAndUpdate(
        { userId: donorId },
        {
          $inc: {
            totalDonationsMade: 1,
            monthlyDonations: 1,
          },
          $set: { lastUpdated: new Date() },
        },
        { upsert: true }
      );
    }

    logger.debug(`📊 Stats updated: donation insert for user ${donorId}`);
  } catch (error) {
    logger.error("Error updating stats on donation insert:", error);
  }
};

/**
 * Update system stats on donation delete
 */
export const onDonationDelete = async (donation: any): Promise<void> => {
  try {
    await SystemStats.findOneAndUpdate(
      {},
      {
        $inc: {
          totalDonations: -1,
          "donations.total": -1,
          [`donations.by_type.${donation.type}`]: -1,
        },
      }
    );

    logger.debug(`📊 Stats updated: donation delete`);
  } catch (error) {
    logger.error("Error updating stats on donation delete:", error);
  }
};

/**
 * Update stats on donation status change
 */
export const onDonationUpdate = async (
  donationId: string,
  oldStatus: string,
  newStatus: string,
  donation?: any
): Promise<void> => {
  try {
    const updates: any = {};
    const donationDoc = donation || (await Donation.findById(donationId));

    if (!donationDoc) return;

    // Handle status-specific updates
    if (newStatus === "COMPLETED" && oldStatus !== "COMPLETED") {
      updates["$inc"] = {
        "donations.completed": 1,
        totalCompletedDonations: 1,
      };

      // Update user stats for donor
      const donorId =
        typeof donationDoc.donorId === "object"
          ? donationDoc.donorId._id?.toString()
          : donationDoc.donorId.toString();

      // Update user stats for requester if exists
      if (donationDoc.requestedBy) {
        const requesterId =
          typeof donationDoc.requestedBy === "object"
            ? donationDoc.requestedBy._id?.toString()
            : donationDoc.requestedBy.toString();

        const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
        const donorStats = await UserStats.findOne({ userId: donorId });

        // Check if we need to reset monthly stats
        const isNewMonth = !donorStats || donorStats.currentMonth !== currentMonth;
        
        // Check if this person was already helped this month
        const monthlyHelpedUserIds = isNewMonth ? [] : (donorStats?.monthlyHelpedUserIds || []);
        const alreadyHelpedThisMonth = monthlyHelpedUserIds.some(
          (id: any) => id.toString() === requesterId
        );

        if (isNewMonth) {
          // New month - reset monthly stats
          await UserStats.findOneAndUpdate(
            { userId: donorId },
            {
              $inc: { 
                successfulDonations: 1,
                totalPeopleHelped: 1,
              },
              $set: {
                monthlyPeopleHelped: 1,
                monthlyHelpedUserIds: [requesterId],
                currentMonth: currentMonth,
                lastUpdated: new Date(),
              },
              $addToSet: { helpedUserIds: requesterId },
            },
            { upsert: true }
          );
        } else if (!alreadyHelpedThisMonth) {
          // Same month, but new person helped
          await UserStats.findOneAndUpdate(
            { userId: donorId },
            {
              $inc: { 
                successfulDonations: 1,
                totalPeopleHelped: 1,
                monthlyPeopleHelped: 1,
              },
              $addToSet: { 
                helpedUserIds: requesterId,
                monthlyHelpedUserIds: requesterId,
              },
              $set: { lastUpdated: new Date() },
            },
            { upsert: true }
          );
        } else {
          // Same month, already helped this person - just increment donations
          await UserStats.findOneAndUpdate(
            { userId: donorId },
            {
              $inc: { successfulDonations: 1 },
              $set: { lastUpdated: new Date() },
            },
            { upsert: true }
          );
        }

        await UserStats.findOneAndUpdate(
          { userId: requesterId },
          {
            $inc: { donationsReceived: 1 },
          },
          { upsert: true }
        );
      } else {
        // No requester - just update donor stats
        await UserStats.findOneAndUpdate(
          { userId: donorId },
          {
            $inc: { successfulDonations: 1 },
          },
          { upsert: true }
        );
      }
    }

    // Update driver delivery stats when donation is marked as DELIVERED
    if (newStatus === "delivered" && oldStatus !== "delivered" && donationDoc.assignedDriverId) {
      const driverId =
        typeof donationDoc.assignedDriverId === "object"
          ? donationDoc.assignedDriverId._id?.toString()
          : donationDoc.assignedDriverId.toString();

      const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
      const userStats = await UserStats.findOne({ userId: driverId });

      if (!userStats || userStats.currentMonth !== currentMonth) {
        // New month or first delivery - reset monthly stats
        await UserStats.findOneAndUpdate(
          { userId: driverId },
          {
            $inc: { totalDeliveries: 1 },
            $set: {
              monthlyDeliveries: 1,
              currentMonth: currentMonth,
              lastUpdated: new Date(),
            },
          },
          { upsert: true }
        );
      } else {
        // Same month - increment both counters
        await UserStats.findOneAndUpdate(
          { userId: driverId },
          {
            $inc: {
              totalDeliveries: 1,
              monthlyDeliveries: 1,
            },
            $set: { lastUpdated: new Date() },
          },
          { upsert: true }
        );
      }

      logger.debug(`📊 Stats updated: delivery completed for driver ${driverId}`);
    }

    if (Object.keys(updates).length > 0) {
      await SystemStats.findOneAndUpdate({}, updates, { upsert: true });
    }

    logger.debug(
      `📊 Stats updated: donation status ${oldStatus} -> ${newStatus}`
    );
  } catch (error) {
    logger.error("Error updating stats on donation update:", error);
  }
};

/**
 * Update stats when donation is requested
 */
export const onDonationRequested = async (
  donation: any,
  requesterId: string
): Promise<void> => {
  try {
    await SystemStats.findOneAndUpdate(
      {},
      {
        $inc: {
          totalRequests: 1,
          "requests.total": 1,
        },
      },
      { upsert: true }
    );

    await UserStats.findOneAndUpdate(
      { userId: requesterId },
      {
        $inc: { donationsRequested: 1 },
      },
      { upsert: true }
    );

    logger.debug(`📊 Stats updated: donation requested`);
  } catch (error) {
    logger.error("Error updating stats on donation request:", error);
  }
};

/**
 * Update stats on user registration
 */
export const onUserRegistered = async (
  userId: string,
  roleKey?: string
): Promise<void> => {
  try {
    const updates: any = {
      $inc: {
        totalUsers: 1,
      },
    };

    // Increment role-specific counters
    if (roleKey === "driver") {
      updates.$inc.totalDrivers = 1;
    } else if (roleKey === "business") {
      updates.$inc.totalBusinesses = 1;
    }

    await SystemStats.findOneAndUpdate({}, updates, { upsert: true });

    // Initialize user stats
    await UserStats.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          donationsCompleted: 0,
          totalDonationsMade: 0,
          totalRequestsMade: 0,
          totalDeliveries: 0,
          totalPeopleHelped: 0,
          monthlyPeopleHelped: 0,
          monthlyDonations: 0,
          monthlyDeliveries: 0,
          helpedUserIds: [],
          monthlyHelpedUserIds: [],
        },
      },
      { upsert: true }
    );

    logger.debug(
      `📊 Stats updated: user registered (role: ${roleKey || "user"})`
    );
  } catch (error) {
    logger.error("Error updating stats on user registration:", error);
  }
};

/**
 * Update stats on user email verification
 */
export const onUserVerified = async (): Promise<void> => {
  try {
    await SystemStats.findOneAndUpdate(
      {},
      {
        $inc: {
          "users.verified": 1,
        },
      },
      { upsert: true }
    );

    logger.debug(`📊 Stats updated: user verified`);
  } catch (error) {
    logger.error("Error updating stats on user verification:", error);
  }
};

/**
 * Update stats on user deletion
 */
export const onUserDelete = async (
  userId: string,
  roleKey?: string
): Promise<void> => {
  try {
    const updates: any = {
      $inc: {
        totalUsers: -1,
      },
    };

    // Decrement role-specific counters
    if (roleKey === "driver") {
      updates.$inc.totalDrivers = -1;
    } else if (roleKey === "business") {
      updates.$inc.totalBusinesses = -1;
    }

    await SystemStats.findOneAndUpdate({}, updates);

    // Delete user's stats document
    await UserStats.findOneAndDelete({ userId });

    logger.debug(`📊 Stats updated: user deleted (role: ${roleKey || "user"})`);
  } catch (error) {
    logger.error("Error updating stats on user delete:", error);
  }
};

/**
 * Update stats on request creation
 */
export const onRequestCreated = async (): Promise<void> => {
  try {
    await SystemStats.findOneAndUpdate(
      {},
      {
        $inc: {
          totalRequests: 1,
        },
      },
      { upsert: true }
    );

    logger.debug(`📊 Stats updated: request created`);
  } catch (error) {
    logger.error("Error updating stats on request creation:", error);
  }
};

/**
 * Update stats on request status change
 */
export const onRequestUpdate = async (
  requestId: string,
  oldStatus: string,
  newStatus: string,
  needsDelivery: boolean,
  fulfilledBy?: string,
  driverId?: string
): Promise<void> => {
  try {
    const updates: any = {};

    // Handle status-specific updates
    if (newStatus === "completed" && oldStatus !== "completed") {
      updates["$inc"] = {
        totalCompletedDonations: 1,
      };

      // Update user stats for fulfiller
      if (fulfilledBy) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const fulfillerStats = await UserStats.findOne({ userId: fulfilledBy });

        const isNewMonth = !fulfillerStats || fulfillerStats.currentMonth !== currentMonth;

        if (isNewMonth) {
          await UserStats.findOneAndUpdate(
            { userId: fulfilledBy },
            {
              $inc: { 
                successfulDonations: 1,
              },
              $set: {
                currentMonth: currentMonth,
                lastUpdated: new Date(),
              },
            },
            { upsert: true }
          );
        } else {
          await UserStats.findOneAndUpdate(
            { userId: fulfilledBy },
            {
              $inc: { successfulDonations: 1 },
              $set: { lastUpdated: new Date() },
            },
            { upsert: true }
          );
        }
      }
    }

    // Update driver delivery stats when request is marked as DELIVERED
    if (newStatus === "delivered" && oldStatus !== "delivered" && driverId) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const userStats = await UserStats.findOne({ userId: driverId });

      if (!userStats || userStats.currentMonth !== currentMonth) {
        await UserStats.findOneAndUpdate(
          { userId: driverId },
          {
            $inc: { totalDeliveries: 1 },
            $set: {
              monthlyDeliveries: 1,
              currentMonth: currentMonth,
              lastUpdated: new Date(),
            },
          },
          { upsert: true }
        );
      } else {
        await UserStats.findOneAndUpdate(
          { userId: driverId },
          {
            $inc: {
              totalDeliveries: 1,
              monthlyDeliveries: 1,
            },
            $set: { lastUpdated: new Date() },
          },
          { upsert: true }
        );
      }

      logger.debug(`📊 Stats updated: request delivery completed for driver ${driverId}`);
    }

    if (Object.keys(updates).length > 0) {
      await SystemStats.findOneAndUpdate({}, updates, { upsert: true });
    }

    logger.debug(
      `📊 Stats updated: request status ${oldStatus} -> ${newStatus}`
    );
  } catch (error) {
    logger.error("Error updating stats on request update:", error);
  }
};
