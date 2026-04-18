import express from 'express';
import * as permissionController from './permission.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { requirePermission } from '../../shared/middleware/permission.middleware';

const router = express.Router();

// All routes require authentication and admin permissions
router.use(authenticate);

// Permission CRUD
router.get(
  '/',
  requirePermission('permissions.view'),
  permissionController.getAllPermissions
);

router.get(
  '/by-category',
  requirePermission('permissions.view'),
  permissionController.getPermissionsByCategory
);

router.get(
  '/:id',
  requirePermission('permissions.view'),
  permissionController.getPermissionById
);

router.post(
  '/',
  requirePermission('permissions.create'),
  permissionController.createPermission
);

router.put(
  '/:id',
  requirePermission('permissions.edit'),
  permissionController.updatePermission
);

router.delete(
  '/:id',
  requirePermission('permissions.delete'),
  permissionController.deletePermission
);

// User permission management
router.post(
  '/grant-to-user',
  requirePermission('permissions.grant'),
  permissionController.grantPermissionToUser
);

router.post(
  '/deny-to-user',
  requirePermission('permissions.deny'),
  permissionController.denyPermissionToUser
);

router.post(
  '/remove-user-override',
  requirePermission('permissions.grant', 'permissions.deny'),
  permissionController.removeUserPermissionOverride
);

router.get(
  '/user/:userId',
  requirePermission('permissions.view', 'users.view'),
  permissionController.getUserPermissions
);

router.post(
  '/bulk-update-user',
  requirePermission('permissions.grant', 'permissions.deny'),
  permissionController.bulkUpdateUserPermissions
);

export default router;





