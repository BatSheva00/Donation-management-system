import { body, param } from "express-validator";
import { RatingType } from "./rating.model";

export const createRatingValidation = [
  body("donationId")
    .notEmpty()
    .withMessage("Donation ID is required")
    .isMongoId()
    .withMessage("Invalid donation ID"),

  body("type")
    .notEmpty()
    .withMessage("Rating type is required")
    .isIn(Object.values(RatingType))
    .withMessage("Invalid rating type. Must be 'driver_rating' or 'donor_rating'"),

  body("value")
    .notEmpty()
    .withMessage("Rating value is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .isString()
    .withMessage("Comment must be a string")
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters")
    .trim(),
];

export const getUserRatingsValidation = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID"),
];

export const getDonationRatingsValidation = [
  param("donationId")
    .notEmpty()
    .withMessage("Donation ID is required")
    .isMongoId()
    .withMessage("Invalid donation ID"),
];

export const canRateValidation = [
  param("donationId")
    .notEmpty()
    .withMessage("Donation ID is required")
    .isMongoId()
    .withMessage("Invalid donation ID"),
];
