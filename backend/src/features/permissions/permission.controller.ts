import { Request, Response, NextFunction } from "express";
import { Permission } from "./permission.model";
import { Role } from "../roles/role.model";
import { User } from "../users/user.model";
import { AppError } from "../../shared/utils/AppError";

/**
 * Get all permissions
 */
export const getAllPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, isActive } = req.query;

    const filter: any = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const permissions = await Permission.find(filter).sort({
      category: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      data: permissions,
      count: permissions.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get permission by ID
 */
export const getPermissionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return next(new AppError("Permission not found", 404));
    }

    res.status(200).json({
      success: true,
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new permission
 */
export const createPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, key, description, category, isActive } = req.body;

    // Check if permission with this key already exists
    const existingPermission = await Permission.findOne({ key });
    if (existingPermission) {
      return next(new AppError("Permission with this key already exists", 400));
    }

    const permission = await Permission.create({
      name,
      key,
      description,
      category,
      isActive,
    });

    res.status(201).json({
      success: true,
      data: permission,
      message: "Permission created successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update permission
 */
export const updatePermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, category, isActive } = req.body;

    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return next(new AppError("Permission not found", 404));
    }

    // Update fields
    if (name) permission.name = name;
    if (description) permission.description = description;
    if (category) permission.category = category;
    if (isActive !== undefined) permission.isActive = isActive;

    await permission.save();

    res.status(200).json({
      success: true,
      data: permission,
      message: "Permission updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete permission
 */
export const deletePermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return next(new AppError("Permission not found", 404));
    }

    // Check if permission is assigned to any roles
    const rolesWithPermission = await Role.find({
      permissions: permission._id,
    });

    if (rolesWithPermission.length > 0) {
      return next(
        new AppError(
          "Cannot delete permission that is assigned to roles. Remove it from roles first.",
          400
        )
      );
    }

    // Check if permission is assigned to any users
    const usersWithPermission = await User.find({
      $or: [
        { permissionsGranted: permission._id },
        { permissionsDenied: permission._id },
      ],
    });

    if (usersWithPermission.length > 0) {
      return next(
        new AppError(
          "Cannot delete permission that is assigned to users. Remove it from users first.",
          400
        )
      );
    }

    await permission.deleteOne();

    res.status(200).json({
      success: true,
      message: "Permission deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get permissions by category
 */
export const getPermissionsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const permissions = await Permission.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: "$category",
          permissions: {
            $push: {
              _id: "$_id",
              name: "$name",
              key: "$key",
              description: "$description",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          permissions: 1,
        },
      },
      {
        $sort: { category: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Grant permission to user
 */
export const grantPermissionToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, permissionId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const permission = await Permission.findById(permissionId);
    if (!permission) {
      return next(new AppError("Permission not found", 404));
    }

    // Remove from denied if exists
    user.permissionsDenied = user.permissionsDenied.filter(
      (p) => p.toString() !== permissionId
    );

    // Add to granted if not already there
    if (!user.permissionsGranted.some((p) => p.toString() === permissionId)) {
      user.permissionsGranted.push(permissionId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Permission granted to user successfully",
      data: { userId, permissionId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deny permission to user
 */
export const denyPermissionToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, permissionId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const permission = await Permission.findById(permissionId);
    if (!permission) {
      return next(new AppError("Permission not found", 404));
    }

    // Remove from granted if exists
    user.permissionsGranted = user.permissionsGranted.filter(
      (p) => p.toString() !== permissionId
    );

    // Add to denied if not already there
    if (!user.permissionsDenied.some((p) => p.toString() === permissionId)) {
      user.permissionsDenied.push(permissionId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Permission denied to user successfully",
      data: { userId, permissionId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove user-specific permission override
 */
export const removeUserPermissionOverride = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, permissionId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Remove from both granted and denied
    user.permissionsGranted = user.permissionsGranted.filter(
      (p) => p.toString() !== permissionId
    );
    user.permissionsDenied = user.permissionsDenied.filter(
      (p) => p.toString() !== permissionId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "User permission override removed successfully",
      data: { userId, permissionId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's effective permissions
 */
export const getUserPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate("role")
      .populate("permissionsGranted")
      .populate("permissionsDenied");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const effectivePermissions = new Set<string>();
    const permissionDetails: any = {
      rolePermissions: [],
      permissionsGranted: [],
      permissionsDenied: [],
      effectivePermissions: [],
    };

    // Get role permissions
    if (user.role) {
      const role = await Role.findById(user.role).populate("permissions");
      if (role) {
        permissionDetails.rolePermissions = role.permissions;
        for (const permission of role.permissions as any[]) {
          if (permission.isActive) {
            effectivePermissions.add(permission.key);
          }
        }
      }
    }

    // Add granted permissions
    permissionDetails.permissionsGranted = user.permissionsGranted;
    for (const permission of user.permissionsGranted as any[]) {
      if (permission.isActive) {
        effectivePermissions.add(permission.key);
      }
    }

    // Remove denied permissions
    permissionDetails.permissionsDenied = user.permissionsDenied;
    for (const permission of user.permissionsDenied as any[]) {
      effectivePermissions.delete(permission.key);
    }

    permissionDetails.effectivePermissions = Array.from(effectivePermissions);

    res.status(200).json({
      success: true,
      data: permissionDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update user permissions
 */
export const bulkUpdateUserPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, permissionsGranted, permissionsDenied } = req.body;

    if (
      !Array.isArray(permissionsGranted) ||
      !Array.isArray(permissionsDenied)
    ) {
      return next(
        new AppError(
          "permissionsGranted and permissionsDenied must be arrays",
          400
        )
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Validate all permission IDs exist
    const allPermissionIds = [...permissionsGranted, ...permissionsDenied];
    if (allPermissionIds.length > 0) {
      const permissions = await Permission.find({
        _id: { $in: allPermissionIds },
      });
      if (permissions.length !== allPermissionIds.length) {
        return next(
          new AppError("One or more permission IDs are invalid", 400)
        );
      }
    }

    // Update user permissions
    user.permissionsGranted = permissionsGranted;
    user.permissionsDenied = permissionsDenied;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User permissions updated successfully",
      data: {
        userId,
        permissionsGranted,
        permissionsDenied,
      },
    });
  } catch (error) {
    next(error);
  }
};
