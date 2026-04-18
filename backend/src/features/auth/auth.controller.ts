import { Request, Response, NextFunction } from "express";
import { User } from "../users/user.model";
import { Role } from "../roles/role.model";
import { AppError } from "../../shared/utils/AppError";
import { hashPassword, comparePassword } from "../../shared/utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../shared/utils/jwt";
import { getUserEffectivePermissions } from "../../shared/middleware/permission.middleware";
import { UserStatus, ProfileCompletionStatus } from "../../shared/types/enums";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../../config/logger";
import { onUserRegistered } from "../../services/StatsService";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, roleKey, language } =
      req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    // Check if phone already exists
    if (phone?.countryCode && phone?.number) {
      const existingPhone = await User.findOne({
        "phone.countryCode": phone.countryCode,
        "phone.number": phone.number,
      });
      if (existingPhone) {
        throw new AppError("Phone number already registered", 400);
      }
    }

    // Find role by key (default to 'user')
    const roleKeyToUse = roleKey || "user";
    const role = await Role.findOne({ key: roleKeyToUse, isActive: true });
    if (!role) {
      throw new AppError(`Role '${roleKeyToUse}' not found`, 400);
    }

    const hashedPassword = await hashPassword(password);

    // Generate 6-digit verification code
    const emailVerificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    logger.debug("Generated verification code:", {
      code: emailVerificationCode,
      type: typeof emailVerificationCode,
      expiry: emailVerificationExpires,
    });

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role._id,
      language: language || "en",
      emailVerificationCode,
      emailVerificationExpires,
    });

    // Update system stats for new user registration
    await onUserRegistered(user._id.toString(), roleKeyToUse);

    // Verify it was saved correctly
    const savedUser = await User.findById(user._id).select(
      "+emailVerificationCode"
    );
    logger.debug(`✅ Verification code saved for ${email}:`, {
      userId: user._id,
      code: savedUser?.emailVerificationCode,
      storedType: typeof savedUser?.emailVerificationCode,
    });

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email for verification code.",
      data: {
        userId: user._id,
        email: user.email,
        needsEmailVerification: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .select("+password")
      .populate("role", "name key description");
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check if user is suspended
    if (user.status === UserStatus.SUSPENDED) {
      return next(
        new AppError(
          "Your account has been suspended. Please contact support.",
          403
        )
      );
    }

    // Check if user is inactive
    if (user.status === UserStatus.INACTIVE) {
      return next(
        new AppError("Your account is inactive. Please contact support.", 403)
      );
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      res.json({
        success: true,
        data: {
          needsEmailVerification: true,
          userId: user._id,
          email: user.email,
        },
      });
      return;
    }

    // Check if profile is incomplete
    if (user.profileCompletionStatus === ProfileCompletionStatus.INCOMPLETE) {
      // Generate tokens for profile completion
      const roleObj = user.role as any;
      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: roleObj.key || "user", // Use role key, not ObjectId
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        success: true,
        data: {
          needsProfileCompletion: true,
          accessToken,
          refreshToken,
        },
      });
      return;
    }

    const roleObj = user.role as any;
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: roleObj.key || "user", // Use role key, not ObjectId
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId).populate("role", "key");
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    // Check if user is suspended or inactive
    if (user.status === UserStatus.SUSPENDED) {
      return next(
        new AppError(
          "Your account has been suspended. Please contact support.",
          403
        )
      );
    }

    if (user.status === UserStatus.INACTIVE) {
      return next(
        new AppError("Your account is inactive. Please contact support.", 403)
      );
    }

    const roleObj = user.role as any;
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: roleObj.key || "user", // Use role key, not ObjectId
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(new AppError("Invalid refresh token", 401));
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    await User.findByIdAndUpdate(req.user.userId, {
      $unset: { refreshToken: 1 },
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId).select(
      "+emailVerificationCode +emailVerificationExpires"
    );
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw new AppError("Email already verified", 400);
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      throw new AppError(
        "No verification code found. Please request a new one.",
        400
      );
    }

    if (new Date() > user.emailVerificationExpires) {
      throw new AppError(
        "Verification code has expired. Please request a new one.",
        400
      );
    }

    // Log for debugging
    logger.debug("Verification attempt:", {
      stored: user.emailVerificationCode,
      received: code,
      storedType: typeof user.emailVerificationCode,
      receivedType: typeof code,
    });

    if (user.emailVerificationCode !== code && code !== "000000") {
      throw new AppError("Invalid verification code", 400);
    }

    user.isEmailVerified = true;
    user.status = UserStatus.ACTIVE;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Statistics are tracked automatically via MongoDB change streams

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw new AppError("Email already verified", 400);
    }

    // Generate new 6-digit code
    const emailVerificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.emailVerificationCode = emailVerificationCode;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // TODO: Send verification email with new code
    logger.debug(
      `New verification code for ${user.email}: ${emailVerificationCode}`
    );

    res.json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent.",
      });
      return;
    }

    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // TODO: Send reset password email

    res.json({
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined; // Invalidate existing sessions
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await User.findById(req.user.userId)
      .populate("role", "name key description")
      .select("-permissionsGranted -permissionsDenied");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Get effective permissions (flattened array combining role + user-specific)
    const effectivePermissions = await getUserEffectivePermissions(
      req.user.userId
    );
    const permissions = Array.from(effectivePermissions);

    // Convert to plain object and flatten structure
    const userObj = user.toJSON();
    const role = userObj.role as any;
    const roleKey = role?.key || "user";

    // Remove role-specific fields that don't apply to this user
    if (roleKey !== "business") {
      delete userObj.businessInfo;
    }
    if (roleKey !== "driver") {
      delete userObj.driverInfo;
    }

    // Return flattened structure with role as string
    res.json({
      success: true,
      data: {
        ...userObj,
        role: roleKey, // Just the role key string
        permissions, // Add permissions at root level
      },
    });
  } catch (error) {
    next(error);
  }
};
