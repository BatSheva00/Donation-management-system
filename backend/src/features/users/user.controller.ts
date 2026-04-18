import { Request, Response, NextFunction } from "express";
import { User } from "./user.model";
import { Role } from "../roles/role.model";
import { AppError } from "../../shared/utils/AppError";
import { hashPassword } from "../../shared/utils/password";
import { UserStatus, ProfileCompletionStatus } from "../../shared/types/enums";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { notifyUserChange } from "../../services/NotificationService";
import {
  onUserRegistered,
  onUserVerified,
  onUserDelete,
} from "../../services/StatsService";
import {
  sendNotificationToRole,
  sendNotificationToUser,
} from "../notifications/notification.service";

/**
 * Get all users (Admin)
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      role,
      status,
      profileCompletionStatus,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (profileCompletionStatus)
      filter.profileCompletionStatus = profileCompletionStatus;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(filter)
      .populate("role", "name key description")
      .populate("permissionsGranted", "name key description")
      .populate("permissionsDenied", "name key description")
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("role", "name key description permissions")
      .populate("permissionsGranted", "name key description category")
      .populate("permissionsDenied", "name key description category")
      .select("-password -refreshToken");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user (Admin)
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      roleId,
      status,
      phone,
      language,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("User with this email already exists", 400));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Validate role if provided
    if (roleId) {
      const roleExists = await Role.findById(roleId);
      if (!roleExists) {
        return next(new AppError("Invalid role ID", 400));
      }
    }

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: roleId,
      status,
      phone,
      language: language || "en",
      isEmailVerified: true, // Admin-created users are auto-verified
    });

    const userWithoutPassword = await User.findById(user._id)
      .populate("role", "name key description")
      .select("-password -refreshToken");

    // Update statistics
    await onUserRegistered(user._id.toString());

    // Send real-time notifications
    notifyUserChange("insert", userWithoutPassword);

    res.status(201).json({
      success: true,
      data: userWithoutPassword,
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      roleId,
      status,
      language,
      isEmailVerified,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Validate role if provided
    if (roleId) {
      const roleExists = await Role.findById(roleId);
      if (!roleExists) {
        return next(new AppError("Invalid role ID", 400));
      }
    }

    // Track if email verification changed
    const wasVerified = user.isEmailVerified;

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (roleId) user.role = roleId;
    if (status) user.status = status;
    if (language) user.language = language;
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

    await user.save();

    // Update statistics if email was just verified
    if (!wasVerified && user.isEmailVerified) {
      await onUserVerified();
    }

    const updatedUser = await User.findById(user._id)
      .populate("role", "name key description")
      .populate("permissionsGranted", "name key description")
      .populate("permissionsDenied", "name key description")
      .select("-password -refreshToken");

    // Send real-time notifications
    notifyUserChange("update", updatedUser);

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id).populate("role", "key");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Prevent deleting self
    if (user._id.toString() === req.user?.userId) {
      return next(new AppError("You cannot delete your own account", 400));
    }

    const userId = user._id.toString();
    const roleKey = (user.role as any)?.key;

    await user.deleteOne();

    // Update statistics
    await onUserDelete(userId, roleKey);

    // Send real-time notifications
    notifyUserChange("delete", null, userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user password (Admin)
 */
export const updateUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 8) {
      return next(new AppError("Password must be at least 8 characters", 400));
    }

    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Hash and update password
    user.password = await hashPassword(password);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile (for profile page)
 * If requiresReview is true, sets profileCompletionStatus to pending_review
 */
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      address,
      businessInfo,
      driverInfo,
      documents,
      requiresReview = true,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) {
      user.address = {
        ...address,
        state: address.state || "",
        country: "Israel", // Default country is Israel
      };
    }
    if (businessInfo !== undefined) user.businessInfo = businessInfo;
    if (driverInfo !== undefined) user.driverInfo = driverInfo;
    if (documents !== undefined) user.documents = documents;

    // If changes require review, update status
    if (requiresReview) {
      user.profileCompletionStatus = ProfileCompletionStatus.PENDING_REVIEW;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate("role", "name key description permissions")
      .populate("permissionsGranted", "name key description category")
      .populate("permissionsDenied", "name key description category")
      .select("-password -refreshToken");

    res.status(200).json({
      success: true,
      message: requiresReview
        ? "Profile updated successfully. Your profile will be reviewed again."
        : "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusStats = await User.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const activeUsers = await User.countDocuments({ status: "active" });

    res.status(200).json({
      success: true,
      data: {
        total: totalUsers,
        verified: verifiedUsers,
        active: activeUsers,
        byRole: stats,
        byStatus: statusStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update users
 */
export const bulkUpdateUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userIds, updates } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return next(new AppError("User IDs array is required", 400));
    }

    if (!updates || typeof updates !== "object") {
      return next(new AppError("Updates object is required", 400));
    }

    // Validate role if provided
    if (updates.roleId) {
      const roleExists = await Role.findById(updates.roleId);
      if (!roleExists) {
        return next(new AppError("Invalid role ID", 400));
      }
      // Replace roleId with role in updates
      updates.role = updates.roleId;
      delete updates.roleId;
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updates }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} users successfully`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve user (change status to active)
 */
export const approveUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id).populate("role", "key");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.status = UserStatus.ACTIVE;
    user.isEmailVerified = true;
    user.profileCompletionStatus = ProfileCompletionStatus.VERIFIED;
    await user.save();

    // Send notification to the user
    await sendNotificationToUser(user._id.toString(), {
      type: "system",
      title: "Profile Approved",
      message:
        "Your profile has been approved! You can now access all features.",
      data: {},
    });

    // Reload and populate the full user object
    const updatedUser = await User.findById(user._id)
      .populate("role", "name key description")
      .select(
        "-password -refreshToken -emailVerificationCode -verificationToken -resetPasswordToken"
      )
      .lean();

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User approved successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject user profile
 */
export const rejectUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.profileCompletionStatus = ProfileCompletionStatus.INCOMPLETE;
    user.status = UserStatus.INACTIVE;
    await user.save();

    // Send notification to the user
    await sendNotificationToUser(user._id.toString(), {
      type: "system",
      title: "Profile Rejected",
      message: `Your profile has been rejected. Reason: ${
        reason || "Please review your information and try again."
      }`,
      data: { reason },
    });

    // Reload and populate the full user object
    const updatedUser = await User.findById(user._id)
      .populate("role", "name key description")
      .select(
        "-password -refreshToken -emailVerificationCode -verificationToken -resetPasswordToken"
      )
      .lean();

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User profile rejected",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suspend user
 */
export const suspendUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Prevent suspending self
    if (user._id.toString() === req.user?.userId) {
      return next(new AppError("You cannot suspend your own account", 400));
    }

    user.status = UserStatus.SUSPENDED;
    await user.save();

    // Send notification to the user
    await sendNotificationToUser(user._id.toString(), {
      type: "system",
      title: "Account Suspended",
      message:
        reason ||
        "Your account has been suspended. Please contact support for more information.",
      data: { reason },
    });

    const updatedUser = await User.findById(user._id)
      .populate("role")
      .select("-password -refreshToken");

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User suspended successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete user profile
 */
export const completeProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId).populate("role", "key");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.profileCompletionStatus !== ProfileCompletionStatus.INCOMPLETE) {
      return next(new AppError("Profile already completed", 400));
    }

    const { address, businessInfo, driverInfo } = req.body;

    // Update address for all users (with Israel as default country)
    if (address) {
      user.address = {
        ...address,
        state: address.state || "",
        country: "Israel", // Default country is Israel
      };
    }

    // Get role key for comparison
    const roleKey = (user.role as any)?.key;

    // Update business-specific fields
    if (roleKey === "business" && businessInfo) {
      user.businessInfo = {
        ...user.businessInfo,
        ...businessInfo,
      };
    }

    // Update driver-specific fields
    if (roleKey === "driver" && driverInfo) {
      user.driverInfo = {
        ...user.driverInfo,
        ...driverInfo,
      };
    }

    // Mark profile as pending review
    user.profileCompletionStatus = ProfileCompletionStatus.PENDING_REVIEW;
    await user.save();

    // Send notification to all admins (stores in DB and sends via WebSocket)
    await sendNotificationToRole("admin", {
      type: "profile_completion",
      title: "New Profile Completion",
      message: `${user.firstName} ${user.lastName} has completed their profile and is waiting for approval.`,
      data: {
        userId: user._id.toString(),
        userName: `${user.firstName} ${user.lastName}`,
        userRole: roleKey,
      },
    });

    // Also send real-time WebSocket notification to all admins
    notifyUserChange("update", user);

    const updatedUser = await User.findById(userId)
      .populate("role")
      .select("-password -refreshToken");

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Profile submitted for review",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile image (unique per user)
 */
export const uploadProfileImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const file = req.file as Express.Multer.File;

    if (!file) {
      return next(new AppError("No file uploaded", 400));
    }

    // Create public profile images directory if it doesn't exist
    const profileImagesDir = path.join(
      __dirname,
      "../../../uploads/profile-images"
    );
    if (!fs.existsSync(profileImagesDir)) {
      fs.mkdirSync(profileImagesDir, { recursive: true });
    }

    // Process image: resize to profile size and optimize
    const processedFilename = `profile-${userId}-${Date.now()}.jpg`;
    const processedPath = path.join(profileImagesDir, processedFilename);

    await sharp(file.path)
      .resize(400, 400, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 90 })
      .toFile(processedPath);

    // Delete original file
    fs.unlinkSync(file.path);

    // Delete old profile image if exists
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, "../../..", user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
          console.error("Failed to delete old profile image:", err);
        }
      }
    }

    // Save new profile image path (relative to backend root, publicly accessible)
    user.profileImage = `/uploads/profile-images/${processedFilename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      data: {
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile documents with type
 */
export const uploadDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId).populate("role", "key");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const files = req.files as Express.Multer.File[];
    const { documentType } = req.body; // e.g., 'id', 'business_license', 'drivers_license', etc.

    if (!files || files.length === 0) {
      return next(new AppError("No files uploaded", 400));
    }

    if (!documentType) {
      return next(new AppError("Document type is required", 400));
    }

    // Create processed images directory if it doesn't exist
    const processedDir = path.join(
      __dirname,
      "../../../uploads/documents/processed"
    );
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
    }

    // Process and store documents
    const processedDocuments = [];

    for (const file of files) {
      // Process image: resize and optimize
      const processedFilename = `processed-${file.filename}`;
      const processedPath = path.join(processedDir, processedFilename);

      await sharp(file.path)
        .resize(1200, 1200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toFile(processedPath);

      // Delete original file
      fs.unlinkSync(file.path);

      processedDocuments.push({
        type: documentType,
        path: `/uploads/documents/processed/${processedFilename}`,
        filename: processedFilename,
        uploadedAt: new Date(),
      });
    }

    // Store ALL documents in user.documents array, regardless of role
    user.documents = [...(user.documents || []), ...processedDocuments];

    await user.save();

    res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      data: {
        documents: processedDocuments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user documents (for the authenticated user)
 */
export const getMyDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Always read from user.documents array
    const documents = user.documents || [];

    res.status(200).json({
      success: true,
      data: {
        documents,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user documents by user ID (for admins)
 */
export const getUserDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("role", "key");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const roleKey = (user.role as any)?.key;
    
    // Always read from user.documents array
    const documents = user.documents || [];

    res.status(200).json({
      success: true,
      data: {
        userId: id,
        role: roleKey,
        documents,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a specific document
 */
export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id || req.user?.userId;
    const { documentId } = req.params;
    const user = await User.findById(userId).populate("role", "key");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Always delete from user.documents array
    if (!user.documents || user.documents.length === 0) {
      return next(new AppError("Document not found", 404));
    }

    const initialLength = user.documents.length;
    user.documents = user.documents.filter(
      (doc: any) => doc._id.toString() !== documentId
    );
    
    if (user.documents.length >= initialLength) {
      return next(new AppError("Document not found", 404));
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Serve document file (protected - only admin or document owner)
 */
export const serveDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, filename } = req.params;
    const requestingUserId = req.user?.userId;

    if (!requestingUserId) {
      return next(new AppError("Unauthorized", 401));
    }

    // Check if user is admin or the document owner
    const requestingUser = await User.findById(requestingUserId).populate(
      "role",
      "key"
    );
    const roleKey = (requestingUser?.role as any)?.key;
    const isAdmin = roleKey === "admin";
    const isOwner = requestingUserId === userId;

    if (!isAdmin && !isOwner) {
      return next(
        new AppError("You don't have permission to access this document", 403)
      );
    }

    // Verify document belongs to the user
    const user = await User.findById(userId).populate("role", "key");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if document exists in user's documents array
    const documentExists = user.documents?.some(
      (doc: any) => doc.filename === filename
    );

    if (!documentExists) {
      return next(new AppError("Document not found", 404));
    }

    // Serve the file
    const filePath = path.join(
      __dirname,
      "../../../uploads/documents/processed",
      filename
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(new AppError("File not found on server", 404));
    }

    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin verify user profile
 */
export const verifyUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findById(id).populate("role", "key");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const roleKey = (user.role as any)?.key;

    if (status === "verified") {
      user.profileCompletionStatus = ProfileCompletionStatus.VERIFIED;
      user.status = UserStatus.ACTIVE; // Activate the user account
      user.isEmailVerified = true; // Ensure email is verified

      // Mark sub-objects as verified if they exist
      if (roleKey === "business" && user.businessInfo) {
        user.businessInfo = {
          ...user.businessInfo,
          rating: user.businessInfo.rating || 0,
        };
      } else if (roleKey === "driver" && user.driverInfo) {
        user.driverInfo = {
          ...user.driverInfo,
          rating: user.driverInfo.rating || 0,
        };
      }
    } else if (status === "rejected") {
      user.profileCompletionStatus = ProfileCompletionStatus.REJECTED;
      // Don't change the user status - they can resubmit
      // TODO: Store rejection reason somewhere
    }

    await user.save();

    const updatedUser = await User.findById(id)
      .populate("role")
      .select("-password -refreshToken");

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: `Profile ${status} successfully`,
    });
  } catch (error) {
    next(error);
  }
};
