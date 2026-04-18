# Permission System Documentation

## Overview

The KindLoop backend implements a comprehensive **Role-Based Access Control (RBAC)** system with **user-level permission overrides**. This provides flexible and granular control over what actions users can perform.

## Architecture

### Key Concepts

1. **Permissions**: Individual actions that can be performed (e.g., `donations.create`, `users.edit`)
2. **Roles**: Collections of permissions assigned to users (e.g., `admin`, `business`, `driver`)
3. **User Permission Overrides**: Individual permissions granted or denied to specific users
4. **Permission Priority**: `User Denied > User Granted > Role Permissions`

### Models

#### Permission Model
```typescript
{
  name: string;          // Human-readable name
  key: string;           // Unique identifier (e.g., 'donations.create')
  description: string;   // What the permission allows
  category: string;      // Permission category (e.g., 'donations')
  isActive: boolean;     // Can be disabled without deletion
}
```

#### Role Model
```typescript
{
  name: string;                      // Human-readable name
  key: string;                       // Unique identifier (e.g., 'admin')
  description: string;               // Role description
  permissions: ObjectId[];           // Array of permission IDs
  isActive: boolean;                 // Can be disabled
  isSystemRole: boolean;             // Cannot be deleted
}
```

#### User Model (Additions)
```typescript
{
  roleRef: ObjectId;                 // Reference to Role model
  permissionsGranted: ObjectId[];    // Extra permissions for this user
  permissionsDenied: ObjectId[];     // Permissions removed from this user
}
```

## Permission Categories

### 1. Permissions Management (`permissions.*`)
- `permissions.view` - View all permissions
- `permissions.create` - Create new permissions
- `permissions.edit` - Edit permissions
- `permissions.delete` - Delete permissions
- `permissions.grant` - Grant permissions to users
- `permissions.deny` - Deny permissions from users

### 2. Role Management (`roles.*`)
- `roles.view` - View all roles
- `roles.create` - Create new roles
- `roles.edit` - Edit roles
- `roles.delete` - Delete roles
- `roles.assign` - Assign roles to users

### 3. User Management (`users.*`)
- `users.view` - View all users
- `users.create` - Create new users
- `users.edit` - Edit any user
- `users.delete` - Delete users
- `users.view.own` - View own profile
- `users.edit.own` - Edit own profile

### 4. Donation Management (`donations.*`)
- `donations.view` - View all donations
- `donations.view.own` - View own donations
- `donations.create` - Create donations
- `donations.edit` - Edit any donation
- `donations.edit.own` - Edit own donations
- `donations.delete` - Delete any donation
- `donations.delete.own` - Delete own donations
- `donations.approve` - Approve pending donations

### 5. Request Management (`requests.*`)
- `requests.view` - View all requests
- `requests.view.own` - View own requests
- `requests.create` - Create requests
- `requests.edit` - Edit any request
- `requests.edit.own` - Edit own requests
- `requests.delete` - Delete any request
- `requests.delete.own` - Delete own requests
- `requests.approve` - Approve pending requests

### 6. Business Management (`businesses.*`)
- `businesses.view` - View all businesses
- `businesses.create` - Register new businesses
- `businesses.edit` - Edit business information
- `businesses.delete` - Delete businesses
- `businesses.verify` - Verify business accounts

### 7. Driver Management (`drivers.*`)
- `drivers.view` - View all drivers
- `drivers.assign` - Assign deliveries to drivers
- `drivers.accept` - Accept delivery assignments
- `drivers.complete` - Mark deliveries as completed

### 8. Packer Management (`packers.*`)
- `packers.view` - View packing tasks
- `packers.accept` - Accept packing assignments
- `packers.complete` - Mark packing as completed

### 9. Payment Management (`payments.*`)
- `payments.view` - View all payments
- `payments.process` - Process payments
- `payments.refund` - Process refunds

### 10. System Administration (`system.*`)
- `system.stats` - View system statistics
- `system.logs` - View system logs
- `system.config` - Modify system configuration

## Default System Roles

### 1. Admin
- **All permissions**
- Full system access
- Cannot be deleted (system role)

### 2. User
- `users.view.own`, `users.edit.own`
- `requests.view`, `requests.view.own`, `requests.create`, `requests.edit.own`, `requests.delete.own`
- `donations.view`, `donations.view.own`

### 3. Business
- User permissions +
- `donations.create`, `donations.edit.own`, `donations.delete.own`
- `businesses.view`

### 4. Driver
- User permissions +
- `drivers.accept`, `drivers.complete`
- `donations.view`

### 5. Packer
- User permissions +
- `packers.view`, `packers.accept`, `packers.complete`
- `donations.view`

## Middleware Usage

### Basic Permission Check (OR logic)
Check if user has **at least one** of the required permissions:

```typescript
import { requirePermission } from '../shared/middleware/permission.middleware';

// User needs either 'donations.view' OR 'donations.view.own'
router.get('/donations', 
  authenticate, 
  requirePermission('donations.view', 'donations.view.own'),
  getDonations
);
```

### All Permissions Required (AND logic)
Check if user has **all** required permissions:

```typescript
import { requireAllPermissions } from '../shared/middleware/permission.middleware';

// User needs BOTH permissions
router.post('/donations/approve', 
  authenticate, 
  requireAllPermissions('donations.view', 'donations.approve'),
  approveDonation
);
```

### Permission or Ownership Check
Allow access if user has permission **OR** owns the resource:

```typescript
import { requirePermissionOrOwnership } from '../shared/middleware/permission.middleware';

// User can access if they have permission OR they own the resource
router.get('/donations/:userId',
  authenticate,
  requirePermissionOrOwnership('donations.view', 'userId'),
  getUserDonations
);
```

## API Endpoints

### Permission Management

#### Get All Permissions
```
GET /api/permissions
Query: ?category=donations&isActive=true
Auth: Required (permissions.view)
```

#### Get Permissions by Category
```
GET /api/permissions/by-category
Auth: Required (permissions.view)
```

#### Get Permission by ID
```
GET /api/permissions/:id
Auth: Required (permissions.view)
```

#### Create Permission
```
POST /api/permissions
Auth: Required (permissions.create)
Body: { name, key, description, category, isActive }
```

#### Update Permission
```
PUT /api/permissions/:id
Auth: Required (permissions.edit)
Body: { name, description, category, isActive }
```

#### Delete Permission
```
DELETE /api/permissions/:id
Auth: Required (permissions.delete)
```

#### Grant Permission to User
```
POST /api/permissions/grant-to-user
Auth: Required (permissions.grant)
Body: { userId, permissionId }
```

#### Deny Permission to User
```
POST /api/permissions/deny-to-user
Auth: Required (permissions.deny)
Body: { userId, permissionId }
```

#### Remove User Permission Override
```
POST /api/permissions/remove-user-override
Auth: Required (permissions.grant OR permissions.deny)
Body: { userId, permissionId }
```

#### Get User's Effective Permissions
```
GET /api/permissions/user/:userId
Auth: Required (permissions.view OR users.view)
Returns: { rolePermissions, grantedPermissions, deniedPermissions, effectivePermissions }
```

### Role Management

#### Get All Roles
```
GET /api/roles
Query: ?isActive=true
Auth: Required (roles.view)
```

#### Get Role by ID
```
GET /api/roles/:id
Auth: Required (roles.view)
```

#### Create Role
```
POST /api/roles
Auth: Required (roles.create)
Body: { name, key, description, permissions[], isActive, isSystemRole }
```

#### Update Role
```
PUT /api/roles/:id
Auth: Required (roles.edit)
Body: { name, description, permissions[], isActive }
```

#### Delete Role
```
DELETE /api/roles/:id
Auth: Required (roles.delete)
Note: Cannot delete system roles or roles assigned to users
```

#### Add Permission to Role
```
POST /api/roles/add-permission
Auth: Required (roles.edit)
Body: { roleId, permissionId }
```

#### Remove Permission from Role
```
POST /api/roles/remove-permission
Auth: Required (roles.edit)
Body: { roleId, permissionId }
```

#### Assign Role to User
```
POST /api/roles/assign-to-user
Auth: Required (users.edit OR roles.assign)
Body: { userId, roleId }
```

## Permission Resolution Algorithm

When checking if a user has a permission:

1. **Get Role Permissions**: Load all permissions from user's assigned role
2. **Add User-Granted Permissions**: Merge in any additional permissions granted to the user
3. **Remove User-Denied Permissions**: Remove any permissions explicitly denied to the user
4. **Return Effective Set**: The final set is the user's effective permissions

### Example

User with `business` role:
- **Role Permissions**: `donations.create`, `donations.edit.own`, `donations.view`
- **User Granted**: `donations.edit` (can now edit ALL donations)
- **User Denied**: `donations.create` (cannot create donations despite role)
- **Effective Permissions**: `donations.edit`, `donations.edit.own`, `donations.view`

## Setup & Seeding

### Run Seeds on Server Start

The permissions and roles are automatically seeded on server startup:

```typescript
// In server.ts
import { runSeeds } from './config/seedPermissions';

// After database connection
await runSeeds();
```

### Manual Seeding

```bash
# Run seed command
npm run seed
```

## Best Practices

### 1. Use Descriptive Permission Keys
```typescript
// ✅ Good
'donations.create'
'users.edit.own'
'requests.approve'

// ❌ Bad
'create'
'edit_user'
'approve'
```

### 2. Group Related Permissions
Use consistent categories and prefixes:
- `donations.*` - All donation-related
- `users.*` - All user-related
- `*.own` - Suffix for self-only permissions

### 3. Prefer Role-Based Over User-Specific
- Assign roles to users as much as possible
- Use user-specific overrides sparingly for exceptions
- Document why user overrides were necessary

### 4. Test Permission Changes
```typescript
// Always test after permission changes
const userPermissions = await getUserEffectivePermissions(userId);
console.log(userPermissions); // Verify correct permissions
```

### 5. Use Appropriate Middleware
```typescript
// For viewing resources - OR logic
requirePermission('resource.view', 'resource.view.own')

// For admin actions - AND logic
requireAllPermissions('resource.view', 'resource.delete')

// For user resources - Permission OR ownership
requirePermissionOrOwnership('resource.edit', 'userId')
```

## Security Considerations

1. **System Roles**: Cannot be deleted to prevent breaking the system
2. **Permission Validation**: Always check permissions exist before assignment
3. **Cascade Checks**: Prevent deletion of permissions/roles still in use
4. **Audit Trail**: Log all permission changes for security auditing
5. **Least Privilege**: Grant minimum necessary permissions

## Troubleshooting

### Permission Not Working
1. Check user's effective permissions: `GET /api/permissions/user/:userId`
2. Verify permission is active: `isActive: true`
3. Check role assignment: User has `roleRef` set
4. Look for user overrides: Check `permissionsDenied` array

### Role Changes Not Applying
1. Verify role is active: `isActive: true`
2. Check user is assigned to role: `user.roleRef === roleId`
3. Clear any caching if implemented
4. Check for user-level denials overriding role

### Cannot Delete Permission
- Permission is assigned to roles → Remove from roles first
- Permission is assigned to users → Remove user overrides first
- Use `isActive: false` to disable without deleting

## Future Enhancements

- [ ] Permission inheritance (hierarchical permissions)
- [ ] Time-based permissions (temporary access)
- [ ] Context-based permissions (location, time of day)
- [ ] Permission groups/templates
- [ ] Audit log for permission changes
- [ ] Permission usage analytics





