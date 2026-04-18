import { Router } from "express";
import authRoutes from "../features/auth/auth.routes";
import userRoutes from "../features/users/user.routes";
import donationRoutes from "../features/donations/donation.routes";
import requestRoutes from "../features/requests/request.routes";
// Business and driver routes removed - now consolidated in user routes
import adminRoutes from "../features/admin/admin.routes";
import paymentRoutes from "../features/payments/payment.routes";
import notificationRoutes from "../features/notifications/notification.routes";
import permissionRoutes from "../features/permissions/permission.routes";
import roleRoutes from "../features/roles/role.routes";
import addressRoutes from "../features/address/address.routes";
import translateRoutes from "../features/translate/translate.routes";
import ttsRoutes from "../features/tts/tts.routes";
import aiRoutes from "../features/ai/ai.routes";
import statisticsRoutes from "../features/statistics/statistics.routes";
import activityRoutes from "../features/activities/activity.routes";
import ratingRoutes from "../features/ratings/rating.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/donations", donationRoutes);
router.use("/requests", requestRoutes);
// Business and driver endpoints are now part of user routes
router.use("/admin", adminRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/permissions", permissionRoutes);
router.use("/roles", roleRoutes);
router.use("/address", addressRoutes);
router.use("/translate", translateRoutes);
router.use("/tts", ttsRoutes);
router.use("/ai", aiRoutes);
router.use("/statistics", statisticsRoutes);
router.use("/activities", activityRoutes);
router.use("/ratings", ratingRoutes);

export default router;
