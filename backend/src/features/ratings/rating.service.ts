
import mongoose from "mongoose";
import { Rating, RatingType, IRating } from "./rating.model";
import { Donation } from "../donations/donation.model";
import { User } from "../users/user.model";
import { DonationStatus } from "../../shared/types/enums";

// Rating time limit in days (30 days after completion)
const RATING_TIME_LIMIT_DAYS = 30;

export interface CanRateResult {
  canRateDriver: boolean;
  canRateDonor: boolean;
  driverToRate?: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  donorToRate?: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  existingDriverRating?: IRating;
  existingDonorRating?: IRating;
  reason?: string;
}

export interface PendingRating {
  donationId: string;
  donationTitle: string;
  type: RatingType;
  userToRate: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  completedAt: Date;
}

/**
 * Check if a user can rate a specific donation
 */
export const checkCanRate = async (
  userId: string,
  donationId: string
): Promise<CanRateResult> => {
  const donation = await Donation.findById(donationId)
    .populate("donorId", "firstName lastName profileImage")
    .populate("requestedBy", "firstName lastName profileImage")
    .populate("assignedDriverId", "firstName lastName profileImage");

  if (!donation) {
    return {
      canRateDriver: false,
      canRateDonor: false,
      reason: "Donation not found",
    };
  }

  // Donation must be completed
  if (donation.status !== DonationStatus.COMPLETED) {
    return {
      canRateDriver: false,
      canRateDonor: false,
      reason: "Donation is not completed yet",
    };
  }

  // Check time limit (30 days after completion)
  const completedAt = donation.updatedAt;
  const timeLimitMs = RATING_TIME_LIMIT_DAYS * 24 * 60 * 60 * 1000;
  if (Date.now() - completedAt.getTime() > timeLimitMs) {
    return {
      canRateDriver: false,
      canRateDonor: false,
      reason: "Rating period has expired (30 days after completion)",
    };
  }

  // Check for existing ratings
  const existingRatings = await Rating.find({
    donationId: donation._id,
    raterId: userId,
  });

  const existingDriverRating = existingRatings.find(
    (r) => r.type === RatingType.DRIVER_RATING
  );
  const existingDonorRating = existingRatings.find(
    (r) => r.type === RatingType.DONOR_RATING
  );

  const result: CanRateResult = {
    canRateDriver: false,
    canRateDonor: false,
    existingDriverRating,
    existingDonorRating,
  };

  // Recipient can rate driver (if delivery was needed)
  if (
    donation.requestedBy &&
    donation.requestedBy._id.toString() === userId &&
    donation.needsDelivery &&
    donation.assignedDriverId &&
    !existingDriverRating
  ) {
    result.canRateDriver = true;
    result.driverToRate = {
      _id: donation.assignedDriverId._id.toString(),
      firstName: (donation.assignedDriverId as any).firstName,
      lastName: (donation.assignedDriverId as any).lastName,
      profileImage: (donation.assignedDriverId as any).profileImage,
    };
  }

  // Driver can rate donor
  if (
    donation.assignedDriverId &&
    donation.assignedDriverId._id.toString() === userId &&
    donation.donorId &&
    !existingDonorRating
  ) {
    result.canRateDonor = true;
    result.donorToRate = {
      _id: donation.donorId._id.toString(),
      firstName: (donation.donorId as any).firstName,
      lastName: (donation.donorId as any).lastName,
      profileImage: (donation.donorId as any).profileImage,
    };
  }

  return result;
};

/**
 * Create a new rating
 */
export const createRating = async (
  raterId: string,
  donationId: string,
  type: RatingType,
  value: number,
  comment?: string
): Promise<IRating> => {
  const donation = await Donation.findById(donationId);
  if (!donation) {
    throw new Error("Donation not found");
  }

  // Validate the rating is allowed
  const canRateResult = await checkCanRate(raterId, donationId);

  if (type === RatingType.DRIVER_RATING && !canRateResult.canRateDriver) {
    throw new Error(
      canRateResult.reason || "You are not allowed to rate the driver for this donation"
    );
  }

  if (type === RatingType.DONOR_RATING && !canRateResult.canRateDonor) {
    throw new Error(
      canRateResult.reason || "You are not allowed to rate the donor for this donation"
    );
  }

  // Determine who is being rated
  let ratedUserId: string;
  if (type === RatingType.DRIVER_RATING) {
    if (!donation.assignedDriverId) {
      throw new Error("No driver assigned to this donation");
    }
    ratedUserId = donation.assignedDriverId.toString();
  } else {
    ratedUserId = donation.donorId.toString();
  }

  // Create the rating
  const rating = new Rating({
    donationId,
    raterId,
    ratedUserId,
    type,
    value,
    comment: comment?.trim(),
  });

  await rating.save();

  // Update the user's average rating
  await updateUserAverageRating(ratedUserId, type);

  return rating;
};

/**
 * Calculate and update a user's average rating
 */
export const updateUserAverageRating = async (
  userId: string,
  type: RatingType
): Promise<void> => {
  const result = await Rating.aggregate([
    {
      $match: {
        ratedUserId: new mongoose.Types.ObjectId(userId),
        type,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$value" },
        count: { $sum: 1 },
      },
    },
  ]);

  const averageRating = result[0]?.averageRating || 0;
  const ratingCount = result[0]?.count || 0;

  // Round to 1 decimal place
  const roundedRating = Math.round(averageRating * 10) / 10;

  if (type === RatingType.DRIVER_RATING) {
    await User.findByIdAndUpdate(userId, {
      "driverInfo.rating": roundedRating,
      "driverInfo.ratingCount": ratingCount,
    });
  } else {
    // Donor rating - update donorRating fields
    await User.findByIdAndUpdate(userId, {
      donorRating: roundedRating,
      donorRatingCount: ratingCount,
    });
  }
};

/**
 * Get all ratings for a specific user
 */
export const getRatingsByUser = async (
  userId: string,
  type?: RatingType,
  page: number = 1,
  limit: number = 10
): Promise<{ ratings: IRating[]; total: number; pages: number }> => {
  const query: any = { ratedUserId: userId };
  if (type) {
    query.type = type;
  }

  const total = await Rating.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const ratings = await Rating.find(query)
    .populate("raterId", "firstName lastName profileImage")
    .populate("donationId", "title")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { ratings, total, pages };
};

/**
 * Get ratings for a specific donation
 */
export const getRatingsForDonation = async (
  donationId: string
): Promise<IRating[]> => {
  return Rating.find({ donationId })
    .populate("raterId", "firstName lastName profileImage")
    .populate("ratedUserId", "firstName lastName profileImage")
    .sort({ createdAt: -1 });
};

/**
 * Get donations awaiting rating by the current user
 */
export const getPendingRatings = async (
  userId: string
): Promise<PendingRating[]> => {
  const pendingRatings: PendingRating[] = [];

  // Find completed donations where user is requester (can rate driver)
  const asRequester = await Donation.find({
    requestedBy: userId,
    status: DonationStatus.COMPLETED,
    needsDelivery: true,
    assignedDriverId: { $exists: true },
  })
    .populate("assignedDriverId", "firstName lastName profileImage")
    .select("_id title assignedDriverId updatedAt");

  for (const donation of asRequester) {
    const existingRating = await Rating.findOne({
      donationId: donation._id,
      raterId: userId,
      type: RatingType.DRIVER_RATING,
    });

    if (!existingRating && donation.assignedDriverId) {
      // Check time limit
      const timeLimitMs = RATING_TIME_LIMIT_DAYS * 24 * 60 * 60 * 1000;
      if (Date.now() - donation.updatedAt.getTime() <= timeLimitMs) {
        pendingRatings.push({
          donationId: donation._id.toString(),
          donationTitle: donation.title,
          type: RatingType.DRIVER_RATING,
          userToRate: {
            _id: donation.assignedDriverId._id.toString(),
            firstName: (donation.assignedDriverId as any).firstName,
            lastName: (donation.assignedDriverId as any).lastName,
            profileImage: (donation.assignedDriverId as any).profileImage,
          },
          completedAt: donation.updatedAt,
        });
      }
    }
  }

  // Find completed donations where user is driver (can rate donor)
  const asDriver = await Donation.find({
    assignedDriverId: userId,
    status: DonationStatus.COMPLETED,
  })
    .populate("donorId", "firstName lastName profileImage")
    .select("_id title donorId updatedAt");

  for (const donation of asDriver) {
    const existingRating = await Rating.findOne({
      donationId: donation._id,
      raterId: userId,
      type: RatingType.DONOR_RATING,
    });

    if (!existingRating && donation.donorId) {
      // Check time limit
      const timeLimitMs = RATING_TIME_LIMIT_DAYS * 24 * 60 * 60 * 1000;
      if (Date.now() - donation.updatedAt.getTime() <= timeLimitMs) {
        pendingRatings.push({
          donationId: donation._id.toString(),
          donationTitle: donation.title,
          type: RatingType.DONOR_RATING,
          userToRate: {
            _id: donation.donorId._id.toString(),
            firstName: (donation.donorId as any).firstName,
            lastName: (donation.donorId as any).lastName,
            profileImage: (donation.donorId as any).profileImage,
          },
          completedAt: donation.updatedAt,
        });
      }
    }
  }

  // Sort by completion date (most recent first)
  pendingRatings.sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
  );

  return pendingRatings;
};

/**
 * Get rating statistics for a user
 */
export const getUserRatingStats = async (
  userId: string
): Promise<{
  driverRating: number;
  driverRatingCount: number;
  donorRating: number;
  donorRatingCount: number;
}> => {
  const user = await User.findById(userId).select(
    "driverInfo.rating driverInfo.ratingCount donorRating donorRatingCount"
  );

  return {
    driverRating: user?.driverInfo?.rating || 0,
    driverRatingCount: user?.driverInfo?.ratingCount || 0,
    donorRating: user?.donorRating || 0,
    donorRatingCount: user?.donorRatingCount || 0,
  };
};
