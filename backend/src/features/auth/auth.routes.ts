import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../../shared/middleware/validate.middleware";
import { authLimiter } from "../../shared/middleware/rateLimit.middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";
import * as authController from "./auth.controller";

const router = Router();

// Register
router.post(
  "/register",
  authLimiter,
  validate([
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
    body("firstName").trim().notEmpty(),
    body("lastName").trim().notEmpty(),
    body("phone.countryCode").trim().notEmpty(),
    body("phone.number").trim().notEmpty(),
    body("role").optional().isIn(["user", "business", "driver"]),
  ]),
  authController.register
);

// Login
router.post(
  "/login",
  authLimiter,
  validate([
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ]),
  authController.login
);

// Refresh token
router.post(
  "/refresh",
  validate([body("refreshToken").notEmpty()]),
  authController.refreshToken
);

// Logout
router.post("/logout", authenticate, authController.logout);

// Verify email with 6-digit code
router.post(
  "/verify-email",
  authLimiter,
  validate([
    body("userId").notEmpty(),
    body("code").isLength({ min: 6, max: 6 }).isNumeric(),
  ]),
  authController.verifyEmail
);

// Resend verification code
router.post(
  "/resend-code",
  authLimiter,
  validate([body("userId").notEmpty()]),
  authController.resendVerificationCode
);

// Request password reset
router.post(
  "/forgot-password",
  authLimiter,
  validate([body("email").isEmail().normalizeEmail()]),
  authController.forgotPassword
);

// Reset password
router.post(
  "/reset-password/:token",
  authLimiter,
  validate([body("password").isLength({ min: 8 })]),
  authController.resetPassword
);

// Get current user
router.get("/me", authenticate, authController.getCurrentUser);

export default router;
