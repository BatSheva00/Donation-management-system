import { Router } from "express";
import * as notificationController from "./notification.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all my notifications (with pagination and filtering)
router.get("/", notificationController.getMyNotifications);

// Get unread count
router.get("/unread/count", notificationController.getUnreadCount);

// Get recent unread notifications
router.get("/unread", notificationController.getUnreadNotifications);

// Mark specific notifications as read
router.patch("/mark-read", notificationController.markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", notificationController.markAllAsRead);

// Delete a specific notification
router.delete("/:id", notificationController.deleteNotification);

// Delete all read notifications
router.delete("/read/all", notificationController.deleteAllRead);

export default router;
