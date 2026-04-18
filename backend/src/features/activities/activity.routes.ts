import { Router } from "express";
import { authenticate, authorize } from "../../shared/middleware/auth.middleware";
import * as activityController from "./activity.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my activities
router.get("/my-activities", activityController.getMyActivities);

// Get recent activities (for dashboard)
router.get("/recent", activityController.getRecentActivitiesController);

// Get all activities (admin only)
router.get(
  "/all",
  authorize("admin"),
  activityController.getAllActivitiesController
);

export default router;


