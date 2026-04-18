import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import * as paymentController from "./payment.controller";
import {
  createDonationIntentValidation,
  confirmDonationValidation,
} from "./payment.validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my donation history
router.get("/my-donations", paymentController.getMyDonations);

// Create donation intent (initiate donation)
router.post(
  "/create-donation-intent",
  validate(createDonationIntentValidation),
  paymentController.createDonationIntent
);

// Confirm donation (after Stripe payment succeeds)
router.post(
  "/confirm-donation",
  validate(confirmDonationValidation),
  paymentController.confirmDonation
);

// Admin routes
router.get(
  "/transactions",
  authorize("admin"),
  paymentController.getAllTransactions
);

router.get(
  "/all-donations",
  authorize("admin"),
  paymentController.getAllDonations
);

router.get(
  "/system-balance",
  authorize("admin"),
  paymentController.getSystemBalance
);

router.post(
  "/recalculate-balance",
  authorize("admin"),
  paymentController.recalculateSystemBalance
);

export default router;
