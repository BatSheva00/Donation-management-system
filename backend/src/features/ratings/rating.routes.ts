import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import * as ratingController from "./rating.controller";
import {
  createRatingValidation,
  getUserRatingsValidation,
  getDonationRatingsValidation,
  canRateValidation,
} from "./rating.validation";

const router = Router();

// All rating routes require authentication
router.use(authenticate);

// Create a new rating
router.post(
  "/",
  validate(createRatingValidation),
  ratingController.createRating
);

// Get pending ratings for current user
router.get("/pending", ratingController.getPendingRatings);

// Check if current user can rate a specific donation
router.get(
  "/can-rate/:donationId",
  validate(canRateValidation),
  ratingController.canRateDonation
);

// Get ratings for a specific user
router.get(
  "/user/:userId",
  validate(getUserRatingsValidation),
  ratingController.getRatingsByUser
);

// Get rating statistics for a user
router.get(
  "/stats/:userId",
  validate(getUserRatingsValidation),
  ratingController.getUserRatingStats
);

// Get ratings for a specific donation
router.get(
  "/donation/:donationId",
  validate(getDonationRatingsValidation),
  ratingController.getRatingsForDonation
);

export default router;
