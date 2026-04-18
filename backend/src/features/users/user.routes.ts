import express from "express";
import * as userController from "./user.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { requirePermission } from "../../shared/middleware/permission.middleware";
import {
  uploadSingle,
  uploadMultiple,
} from "../../shared/middleware/upload.middleware";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User management routes
router.get("/", requirePermission("users.view"), userController.getAllUsers);

router.get(
  "/stats",
  requirePermission("users.view", "system.stats"),
  userController.getUserStats
);

router.get(
  "/:id",
  requirePermission("users.view", "users.view.own"),
  userController.getUserById
);

router.post("/", requirePermission("users.create"), userController.createUser);

router.put(
  "/:id",
  requirePermission("users.edit", "users.edit.own"),
  userController.updateUser
);

// Update user profile (for profile page) - user can edit their own
router.put(
  "/:id/profile",
  requirePermission("users.edit", "users.edit.own"),
  userController.updateUserProfile
);

router.delete(
  "/:id",
  requirePermission("users.delete"),
  userController.deleteUser
);

router.put(
  "/:id/password",
  requirePermission("users.edit"),
  userController.updateUserPassword
);

router.post(
  "/bulk-update",
  requirePermission("users.edit"),
  userController.bulkUpdateUsers
);

router.put(
  "/:id/approve",
  requirePermission("users.approve"),
  userController.approveUser
);

router.put(
  "/:id/reject",
  requirePermission("users.approve"),
  userController.rejectUser
);

router.put(
  "/:id/suspend",
  requirePermission("users.suspend"),
  userController.suspendUser
);

// Profile completion routes
router.post("/complete-profile", userController.completeProfile);

// Document management routes
// Upload profile image (unique per user)
router.post(
  "/upload-profile-image",
  uploadSingle("profileImage"),
  userController.uploadProfileImage
);

// Upload multiple verification documents with type
router.post(
  "/upload-documents",
  uploadMultiple("documents", 10),
  userController.uploadDocuments
);

// Get my documents (authenticated user)
router.get("/my-documents", userController.getMyDocuments);

// Delete a specific document (authenticated user)
// Delete user document (user can delete their own, admin can delete any)
router.delete(
  "/:id/documents/:documentId",
  requirePermission("users.edit", "users.edit.own"),
  userController.deleteDocument
);

// Get user documents by ID (admin only)
router.get(
  "/:id/documents",
  requirePermission("users.view"),
  userController.getUserDocuments
);

// Serve document file (protected - only admin or document owner)
router.get("/documents/file/:userId/:filename", userController.serveDocument);

// Admin verify user profile
router.put(
  "/:id/verify-profile",
  requirePermission("users.verify"),
  userController.verifyUserProfile
);

export default router;
