import { Router } from 'express';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import * as donationController from './donation.controller';
import {
  createDonationValidation,
  updateDonationValidation,
  updateDonationStatusValidation,
} from './donation.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all donations with filtering
router.get('/', donationController.getAllDonations);

// Get donation statistics
router.get('/stats', donationController.getDonationStats);

// Get my donations (authenticated user's donations)
router.get('/my-donations', donationController.getMyDonations);

// Create a new donation (user, business, or admin)
router.post(
  '/',
  authorize('business', 'user', 'admin'),
  validate(createDonationValidation),
  donationController.createDonation
);

// Get donation by ID
router.get('/:id', donationController.getDonationById);

// Update donation (donor or admin only)
router.put(
  '/:id',
  validate(updateDonationValidation),
  donationController.updateDonation
);

// Delete donation (donor or admin only)
router.delete('/:id', donationController.deleteDonation);

// Update donation status (admin or driver only)
router.patch(
  '/:id/status',
  authorize('admin', 'driver'),
  validate(updateDonationStatusValidation),
  donationController.updateDonationStatus
);

// Request a donation (authenticated users)
router.post(
  '/:id/request',
  authorize('user', 'business'),
  donationController.requestDonation
);

// Approve a donation request (admin or donor)
router.patch(
  '/:id/approve',
  donationController.approveRequest
);

// Reject a donation request (admin only)
router.patch(
  '/:id/reject',
  authorize('admin'),
  donationController.rejectRequest
);

// Driver self-assignment (driver only)
router.post(
  '/:id/assign-driver',
  authorize('driver'),
  donationController.assignDriverSelf
);

// Driver marks donation as in transit (driver only, must be assigned)
router.patch(
  '/:id/mark-in-transit',
  authorize('driver'),
  donationController.markInTransit
);

// Driver marks donation as delivered (driver only, must be assigned)
router.patch(
  '/:id/mark-delivered',
  authorize('driver'),
  donationController.markDelivered
);

// User marks donation as completed (requester only)
router.patch(
  '/:id/mark-completed',
  donationController.markCompleted
);

// User unassigns themselves from a donation (requester only)
router.patch(
  '/:id/unassign-request',
  authorize('user', 'business'),
  donationController.unassignRequest
);

// Driver unassigns themselves from a delivery (driver only)
router.patch(
  '/:id/unassign-driver',
  authorize('driver'),
  donationController.unassignDriver
);

export default router;






