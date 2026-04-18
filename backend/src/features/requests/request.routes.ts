import express from "express";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware";
import * as requestController from "./request.controller";

const router = express.Router();

// Public routes (authenticated users only)
router.get("/", authenticate, requestController.getRequests);
router.get("/:id", authenticate, requestController.getRequestById);

// User routes
router.post("/", authenticate, requestController.createRequest);
router.get("/my/requests", authenticate, requestController.getMyRequests);
router.get(
  "/my/fulfilled",
  authenticate,
  requestController.getMyFulfilledRequests
);
router.put("/:id", authenticate, requestController.updateRequest);
router.delete("/:id", authenticate, requestController.deleteRequest);

// Request actions
router.post("/:id/fulfill", authenticate, requestController.fulfillRequest);
router.post("/:id/retract", authenticate, requestController.retractFulfillment);
router.post("/:id/cancel", authenticate, requestController.cancelRequest);
router.post("/:id/complete", authenticate, requestController.markCompleted);

// Driver routes
router.post(
  "/:id/assign-driver",
  authenticate,
  authorize("driver"),
  requestController.assignDriver
);
router.post(
  "/:id/unassign-driver",
  authenticate,
  requestController.unassignDriver
);
router.post(
  "/:id/in-transit",
  authenticate,
  authorize("driver"),
  requestController.markInTransit
);
router.post(
  "/:id/delivered",
  authenticate,
  authorize("driver"),
  requestController.markDelivered
);

// Admin routes
router.get(
  "/admin/all",
  authenticate,
  authorize("admin"),
  requestController.getAdminRequests
);
router.post(
  "/:id/approve",
  authenticate,
  authorize("admin"),
  requestController.approveRequest
);
router.post(
  "/:id/reject",
  authenticate,
  authorize("admin"),
  requestController.rejectRequest
);

export default router;
