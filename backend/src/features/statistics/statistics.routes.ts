import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { requirePermission } from "../../shared/middleware/permission.middleware";
import {
  getSystemStats,
  getUserStats,
  getUserStatsById,
  initializeStats,
} from "./statistics.controller";

const router = Router();

// Public route - system stats (can be shown on homepage)
router.get("/system", getSystemStats);

// Protected routes - user must be authenticated
router.get("/me", authenticate, getUserStats);

// Admin routes
router.get(
  "/user/:userId",
  authenticate,
  requirePermission("users:read"),
  getUserStatsById
);

router.post(
  "/initialize",
  authenticate,
  requirePermission("admin:manage"),
  initializeStats
);

export default router;
