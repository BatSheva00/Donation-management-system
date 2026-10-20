import { Router } from "express";
import {
  authenticate,
  authorize,
  optionalAuthenticate,
} from "../../shared/middleware/auth.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import * as donationController from "./donation.controller";
import {
  createDonationValidation,
  updateDonationValidation,
  updateDonationStatusValidation,
} from "./donation.validation";

const router = Router();

router.get("/", optionalAuthenticate, donationController.getAllDonations);
router.get("/stats", authenticate, donationController.getDonationStats);
router.get("/my-donations", authenticate, donationController.getMyDonations);
router.get("/:id", optionalAuthenticate, donationController.getDonationById);

router.post(
  "/",
  authenticate,
  authorize("business", "user", "admin"),
  validate(createDonationValidation),
  donationController.createDonation
);

router.put(
  "/:id",
  authenticate,
  validate(updateDonationValidation),
  donationController.updateDonation
);

router.delete("/:id", authenticate, donationController.deleteDonation);

router.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "driver"),
  validate(updateDonationStatusValidation),
  donationController.updateDonationStatus
);

router.post(
  "/:id/request",
  authenticate,
  authorize("user", "business"),
  donationController.requestDonation
);

router.patch(
  "/:id/approve",
  authenticate,
  donationController.approveRequest
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize("admin"),
  donationController.rejectRequest
);

router.post(
  "/:id/assign-driver",
  authenticate,
  authorize("driver"),
  donationController.assignDriverSelf
);

router.patch(
  "/:id/mark-in-transit",
  authenticate,
  authorize("driver"),
  donationController.markInTransit
);

router.patch(
  "/:id/mark-delivered",
  authenticate,
  authorize("driver"),
  donationController.markDelivered
);

router.patch(
  "/:id/mark-completed",
  authenticate,
  donationController.markCompleted
);

router.patch(
  "/:id/unassign-request",
  authenticate,
  authorize("user", "business"),
  donationController.unassignRequest
);

router.patch(
  "/:id/unassign-driver",
  authenticate,
  authorize("driver"),
  donationController.unassignDriver
);

export default router;
