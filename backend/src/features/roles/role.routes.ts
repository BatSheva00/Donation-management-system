import express from 'express';
import * as roleController from './role.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { requirePermission } from '../../shared/middleware/permission.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Role CRUD
router.get(
  '/',
  requirePermission('roles.view'),
  roleController.getAllRoles
);

router.get(
  '/:id',
  requirePermission('roles.view'),
  roleController.getRoleById
);

router.post(
  '/',
  requirePermission('roles.create'),
  roleController.createRole
);

router.put(
  '/:id',
  requirePermission('roles.edit'),
  roleController.updateRole
);

router.delete(
  '/:id',
  requirePermission('roles.delete'),
  roleController.deleteRole
);

// Role-Permission management
router.post(
  '/add-permission',
  requirePermission('roles.edit'),
  roleController.addPermissionToRole
);

router.post(
  '/remove-permission',
  requirePermission('roles.edit'),
  roleController.removePermissionFromRole
);

// Role-User management
router.post(
  '/assign-to-user',
  requirePermission('users.edit', 'roles.assign'),
  roleController.assignRoleToUser
);

export default router;





