import { Request, Response, NextFunction } from "express";
import { Role } from "./role.model";
import { Permission } from "../permissions/permission.model";
import { User } from "../users/user.model";
import { AppError } from "../../shared/utils/AppError";

/**
 * Get all roles
 */
export const getAllRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { isActive } = req.query;

    const filter: any = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const roles = await Role.find(filter)
      .populate("permissions")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: roles,
      count: roles.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get role by ID
 */
export const getRoleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = await Role.findById(req.params.id).populate("permissions");

    if (!role) {
      return next(new AppError("Role not found", 404));
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new role
 */
export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, key, description, permissions, isActive, isSystemRole } =
      req.body;

    // Check if role with this key already exists
    const existingRole = await Role.findOne({ key });
    if (existingRole) {
      return next(new AppError("Role with this key already exists", 400));
    }

    // Validate permissions exist
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({
        _id: { $in: permissions },
      });

      if (validPermissions.length !== permissions.length) {
        return next(new AppError("Some permissions are invalid", 400));
      }
    }

    const role = await Role.create({
      name,
      key,
      description,
      permissions: permissions || [],
      isActive,
      isSystemRole,
    });

    const populatedRole = await Role.findById(role._id).populate("permissions");

    res.status(201).json({
      success: true,
      data: populatedRole,
      message: "Role created successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update role
 */
export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, permissions, isActive, key } = req.body;

    const role = await Role.findById(req.params.id);

    if (!role) {
      return next(new AppError("Role not found", 404));
    }

    // Prevent modification of system roles key (only if it's actually changing)
    if (role.isSystemRole && key && key !== role.key) {
      return next(new AppError("Cannot modify system role key", 400));
    }

    // Validate permissions exist
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({
        _id: { $in: permissions },
      });

      if (validPermissions.length !== permissions.length) {
        return next(new AppError("Some permissions are invalid", 400));
      }
    }

    // Update fields (name and description can be updated even for system roles)
    if (name && !role.isSystemRole) role.name = name; // Don't change system role name
    if (description) role.description = description;
    if (permissions !== undefined) role.permissions = permissions;
    if (isActive !== undefined) role.isActive = isActive;
    // Don't update key for system roles

    await role.save();

    const updatedRole = await Role.findById(role._id).populate("permissions");

    res.status(200).json({
      success: true,
      data: updatedRole,
      message: "Role updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete role
 */
export const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return next(new AppError("Role not found", 404));
    }

    // Prevent deletion of system roles
    if (role.isSystemRole) {
      return next(new AppError("Cannot delete system role", 400));
    }

    // Check if role is assigned to any users
    const usersWithRole = await User.find({ roleRef: role._id });

    if (usersWithRole.length > 0) {
      return next(
        new AppError(
          "Cannot delete role that is assigned to users. Reassign users first.",
          400
        )
      );
    }

    await role.deleteOne();

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add permission to role
 */
export const addPermissionToRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roleId, permissionId } = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      return next(new AppError("Role not found", 404));
    }

    const permission = await Permission.findById(permissionId);
    if (!permission) {
      return next(new AppError("Permission not found", 404));
    }

    // Check if permission already exists
    if (role.permissions.some((p) => p.toString() === permissionId)) {
      return next(new AppError("Permission already assigned to role", 400));
    }

    role.permissions.push(permissionId);
    await role.save();

    const updatedRole = await Role.findById(role._id).populate("permissions");

    res.status(200).json({
      success: true,
      message: "Permission added to role successfully",
      data: updatedRole,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove permission from role
 */
export const removePermissionFromRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roleId, permissionId } = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      return next(new AppError("Role not found", 404));
    }

    role.permissions = role.permissions.filter(
      (p) => p.toString() !== permissionId
    );

    await role.save();

    const updatedRole = await Role.findById(role._id).populate("permissions");

    res.status(200).json({
      success: true,
      message: "Permission removed from role successfully",
      data: updatedRole,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign role to user
 */
export const assignRoleToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, roleId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return next(new AppError("Role not found", 404));
    }

    if (!role.isActive) {
      return next(new AppError("Cannot assign inactive role", 400));
    }

    user.role = roleId;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Role assigned to user successfully",
      data: { userId, roleId },
    });
  } catch (error) {
    next(error);
  }
};
