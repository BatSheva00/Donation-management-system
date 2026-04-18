import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { User } from "../../features/users/user.model";
import { Role } from "../../features/roles/role.model";
import {
  Permission,
  IPermission,
} from "../../features/permissions/permission.model";

/**
 * Calculate effective permissions for a user
 * User-specific permissions override role permissions
 * Priority: permissionsDenied > permissionsGranted > role permissions
 */
export const getUserEffectivePermissions = async (
  userId: string
): Promise<Set<string>> => {
  const user = await User.findById(userId)
    .populate("role")
    .populate("permissionsGranted")
    .populate("permissionsDenied");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const effectivePermissions = new Set<string>();

  // 1. Get role permissions if role exists
  if (user.role) {
    const role = await Role.findById(user.role).populate("permissions");
    if (role && role.isActive) {
      const permissions = role.permissions as unknown as IPermission[];
      for (const permission of permissions) {
        if (permission.isActive) {
          effectivePermissions.add(permission.key);
        }
      }
    }
  }

  // 2. Add user-granted permissions (override)
  if (user.permissionsGranted && user.permissionsGranted.length > 0) {
    const grantedPerms = await Permission.find({
      _id: { $in: user.permissionsGranted },
      isActive: true,
    });
    for (const permission of grantedPerms) {
      effectivePermissions.add(permission.key);
    }
  }

  // 3. Remove user-denied permissions (highest priority override)
  if (user.permissionsDenied && user.permissionsDenied.length > 0) {
    const deniedPerms = await Permission.find({
      _id: { $in: user.permissionsDenied },
    });
    for (const permission of deniedPerms) {
      effectivePermissions.delete(permission.key);
    }
  }

  return effectivePermissions;
};

/**
 * Middleware to check if user has required permissions
 * @param requiredPermissions - Array of permission keys (OR logic - user needs at least one)
 */
export const requirePermission = (...requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(new AppError("Authentication required", 401));
      }

      const userPermissions = await getUserEffectivePermissions(userId);

      // Check if user has at least one of the required permissions
      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.has(permission)
      );

      if (!hasPermission) {
        return next(
          new AppError("You do not have permission to perform this action", 403)
        );
      }

      // Attach permissions to request for further use
      req.userPermissions = Array.from(userPermissions);

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has ALL required permissions
 * @param requiredPermissions - Array of permission keys (AND logic - user needs all)
 */
export const requireAllPermissions = (...requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(new AppError("Authentication required", 401));
      }

      const userPermissions = await getUserEffectivePermissions(userId);

      // Check if user has ALL required permissions
      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.has(permission)
      );

      if (!hasAllPermissions) {
        return next(
          new AppError(
            "You do not have all required permissions to perform this action",
            403
          )
        );
      }

      // Attach permissions to request for further use
      req.userPermissions = Array.from(userPermissions);

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user can access a specific resource
 * Checks both permission and resource ownership
 */
export const requirePermissionOrOwnership = (
  permissionKey: string,
  resourceOwnerField: string = "userId"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(new AppError("Authentication required", 401));
      }

      const userPermissions = await getUserEffectivePermissions(userId);

      // Check if user has the permission
      if (userPermissions.has(permissionKey)) {
        req.userPermissions = Array.from(userPermissions);
        return next();
      }

      // Check if user owns the resource
      const resourceOwnerId =
        req.params[resourceOwnerField] || req.body[resourceOwnerField];

      if (resourceOwnerId && resourceOwnerId === userId) {
        req.userPermissions = Array.from(userPermissions);
        return next();
      }

      return next(
        new AppError("You do not have permission to access this resource", 403)
      );
    } catch (error) {
      next(error);
    }
  };
};

// Extend Express Request type
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
      userPermissions?: string[];
    }
  }
}
