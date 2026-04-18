import { Request, Response } from "express";
import { RatingType } from "./rating.model";
import * as ratingService from "./rating.service";

/**
 * Create a new rating
 * POST /ratings
 */
export const createRating = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { donationId, type, value, comment } = req.body;

    const rating = await ratingService.createRating(
      userId,
      donationId,
      type as RatingType,
      value,
      comment
    );

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: rating,
    });
  } catch (error: any) {
    console.error("Error creating rating:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create rating",
    });
  }
};

/**
 * Get ratings for a specific user
 * GET /ratings/user/:userId
 */
export const getRatingsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { type, page = "1", limit = "10" } = req.query;

    const result = await ratingService.getRatingsByUser(
      userId,
      type as RatingType | undefined,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result.ratings,
      pagination: {
        total: result.total,
        pages: result.pages,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      },
    });
  } catch (error: any) {
    console.error("Error getting user ratings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get ratings",
    });
  }
};

/**
 * Get ratings for a specific donation
 * GET /ratings/donation/:donationId
 */
export const getRatingsForDonation = async (req: Request, res: Response) => {
  try {
    const { donationId } = req.params;

    const ratings = await ratingService.getRatingsForDonation(donationId);

    res.json({
      success: true,
      data: ratings,
    });
  } catch (error: any) {
    console.error("Error getting donation ratings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get ratings",
    });
  }
};

/**
 * Get pending ratings for current user
 * GET /ratings/pending
 */
export const getPendingRatings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const pendingRatings = await ratingService.getPendingRatings(userId);

    res.json({
      success: true,
      data: pendingRatings,
    });
  } catch (error: any) {
    console.error("Error getting pending ratings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get pending ratings",
    });
  }
};

/**
 * Check if current user can rate a donation
 * GET /ratings/can-rate/:donationId
 */
export const canRateDonation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { donationId } = req.params;

    const result = await ratingService.checkCanRate(userId, donationId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error checking can rate:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check rating eligibility",
    });
  }
};

/**
 * Get rating statistics for a user
 * GET /ratings/stats/:userId
 */
export const getUserRatingStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await ratingService.getUserRatingStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Error getting rating stats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get rating statistics",
    });
  }
};
