import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware";
import * as statisticsController from "./statistics.controller";

const router = Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/dashboard", (req, res) => {
  res.json({ message: "Get admin dashboard data - TODO: Implement" });
});

// Statistics routes
router.get("/statistics", statisticsController.getStatistics);
router.get("/statistics/:collection", statisticsController.getCollectionStats);

router.patch("/donations/:id/approve", (req, res) => {
  res.json({ message: "Approve donation - TODO: Implement" });
});

router.patch("/donations/:id/reject", (req, res) => {
  res.json({ message: "Reject donation - TODO: Implement" });
});

router.patch("/requests/:id/approve", (req, res) => {
  res.json({ message: "Approve request - TODO: Implement" });
});

export default router;
