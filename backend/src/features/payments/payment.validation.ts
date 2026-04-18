import { body } from "express-validator";

export const createDonationIntentValidation = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 1 })
    .withMessage("Amount must be at least $1"),
];

export const confirmDonationValidation = [
  body("paymentIntentId")
    .notEmpty()
    .withMessage("Payment Intent ID is required")
    .isString()
    .withMessage("Payment Intent ID must be a string"),
];

