# Frontend Permission System Guide

## Overview

The frontend has a comprehensive permission-based access control system that allows you to:

- Protect routes based on permissions
- Conditionally render UI elements based on permissions
- Hide navigation items for users without access

## Quick Start

### 1. Protecting Routes

Use `PermissionGuard` in your routes to restrict access:

```tsx
// In App.tsx or your router
<Route
  element={
    <PermissionGuard
      requiredPermissions={["donations.view", "donations.view.own"]}
      requireAll={false} // User needs at least ONE permission
    />
  }
>
  <Route path="donations" element={<DonationsPage />} />
</Route>
```

**Options:**

- `requiredPermissions`: Array of permission keys required
- `requireAll`:
  - `false` (default) - User needs **at least one** permission (OR logic)
  - `true` - User needs **all** permissions (AND logic)
- `fallback`: Custom component to show when access is denied (optional)

### 2. Conditional Rendering with Hook

Use the `usePermission` hook to conditionally render components:

```tsx
import { usePermission } from "../hooks/usePermission";

function MyComponent() {
  const canViewDonations = usePermission("donations.view");
  const canEditUsers = usePermission(["users.edit", "users.delete"], true);

  return (
    <div>
      {canViewDonations && <DonationsButton />}
      {canEditUsers && <EditUserButton />}
    </div>
  );
}
```

### 3. Component Wrapper

Use `PermissionWrapper` for inline conditional rendering:

```tsx
import { PermissionWrapper } from "../hooks/usePermission";

function Navigation() {
  return (
    <nav>
      <PermissionWrapper requiredPermissions="donations.view">
        <Link to="/donations">Donations</Link>
      </PermissionWrapper>

      <PermissionWrapper
        requiredPermissions={["users.edit", "users.delete"]}
        requireAll={true}
        fallback={<span>No access</span>}
      >
        <AdminButton />
      </PermissionWrapper>
    </nav>
  );
}
```

### 4. Direct Store Access

For complex logic, access the auth store directly:

```tsx
import { useAuthStore } from '../stores/authStore';

function ComplexComponent() {
  const { hasPermission, hasAllPermissions, permissions } = useAuthStore();

  // Check single or multiple permissions (OR logic)
  const canView = hasPermission('donations.view', 'donations.view.own');

  // Check if user has ALL permissions (AND logic)
  const canManage = hasAllPermissions('users.edit', 'users.delete');

  // Access raw permissions array
  console.log('User permissions:', permissions);

  return (/* your component */);
}
```

## Common Permission Keys

### Donations

- `donations.view` - View all donations
- `donations.view.own` - View own donations
- `donations.create` - Create donations
- `donations.edit` - Edit any donation
- `donations.edit.own` - Edit own donations
- `donations.delete` - Delete any donation
- `donations.delete.own` - Delete own donations

### Requests

- `requests.view` - View all requests
- `requests.view.own` - View own requests
- `requests.create` - Create requests
- `requests.edit` - Edit any request
- `requests.edit.own` - Edit own requests
- `requests.delete` - Delete any request
- `requests.delete.own` - Delete own requests

### Users

- `users.view` - View all users
- `users.view.own` - View own profile
- `users.create` - Create users
- `users.edit` - Edit any user
- `users.edit.own` - Edit own profile
- `users.delete` - Delete users
- `users.approve` - Approve users
- `users.suspend` - Suspend users
- `users.verify` - Verify user profiles

### Roles

- `roles.view` - View all roles
- `roles.create` - Create new roles
- `roles.edit` - Edit existing roles
- `roles.delete` - Delete roles
- `roles.assign` - Assign roles to users

### Permissions

- `permissions.view` - View all permissions
- `permissions.create` - Create new permissions
- `permissions.edit` - Edit existing permissions
- `permissions.delete` - Delete permissions
- `permissions.grant` - Grant permissions to users
- `permissions.deny` - Deny permissions from users

### System

- `system.admin` - Grants access to the admin panel (still requires specific permissions for each feature)
- `system.stats` - View system statistics
- `system.logs` - View system logs
- `system.config` - Modify system configuration

**Note:** `system.admin` grants access to the admin panel but does NOT bypass individual feature permissions. Users still need specific permissions like `users.view`, `roles.edit`, etc. to see and use those features.

**Creating a Superadmin:** To create a true superadmin with access to everything, assign them the `admin` role which includes all permissions, or manually grant them all the specific permissions they need.

## Best Practices

### 1. Use Specific Permissions

```tsx
// ❌ Bad - Too generic
<PermissionWrapper requiredPermissions="system.admin">

// ✅ Good - Specific to the action
<PermissionWrapper requiredPermissions={['donations.view', 'donations.view.own']}>
```

### 2. Support Both Global and Own Permissions

Many resources have both global and "own" permissions. Always check both:

```tsx
// User can view if they have EITHER global view OR own view
<PermissionGuard
  requiredPermissions={["donations.view", "donations.view.own"]}
  requireAll={false}
/>
```

### 3. Graceful Degradation

Hide features instead of showing error messages when possible:

```tsx
// ✅ Good - Simply hide the button
{
  canDelete && <DeleteButton />;
}

// ❌ Bad - Shows error message
{
  !canDelete && <p>You don't have permission</p>;
}
```

### 4. Performance

Permission checks are very fast, but for complex components, memoize them:

```tsx
const canViewDonations = useMemo(
  () => usePermission(["donations.view", "donations.view.own"]),
  [permissions]
);
```

## Example: Complete Feature

Here's a complete example showing all concepts:

```tsx
// DonationsPage.tsx
import { usePermission } from "../hooks/usePermission";
import PermissionGuard from "../components/auth/PermissionGuard";

function DonationsPage() {
  const canCreate = usePermission(["donations.create"]);
  const canEdit = usePermission(["donations.edit", "donations.edit.own"]);
  const canDelete = usePermission(["donations.delete", "donations.delete.own"]);

  return (
    <div>
      <h1>Donations</h1>

      {canCreate && <Button onClick={handleCreate}>Create Donation</Button>}

      <DonationsList showEditButton={canEdit} showDeleteButton={canDelete} />
    </div>
  );
}

// In App.tsx
<Route
  element={
    <PermissionGuard
      requiredPermissions={["donations.view", "donations.view.own"]}
      requireAll={false}
    />
  }
>
  <Route path="donations" element={<DonationsPage />} />
</Route>;

// In Navbar.tsx
const canViewDonations = usePermission([
  "donations.view",
  "donations.view.own",
]);

{
  canViewDonations && <Link to="/donations">Donations</Link>;
}
```

## Example: User Management Actions

Here's how action buttons in User Management are hidden based on permissions:

```tsx
// UserManagement.tsx
import { usePermission } from "../../../hooks/usePermission";

const UserManagement = () => {
  // Permission checks for individual actions
  const canCreateUser = usePermission(["users.create"]);
  const canEditUser = usePermission(["users.edit"]);
  const canDeleteUser = usePermission(["users.delete"]);
  const canApproveUser = usePermission(["users.approve"]);
  const canSuspendUser = usePermission(["users.suspend"]);
  const canManagePermissions = usePermission([
    "permissions.grant",
    "permissions.deny",
  ]);

  return (
    <div>
      {/* Only show Create button if user has permission */}
      {canCreateUser && <Button onClick={handleCreate}>Create User</Button>}

      <Table>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              {/* View Details - always visible */}
              <IconButton onClick={() => handleView(user)}>
                <Visibility />
              </IconButton>

              {/* Edit - only if has permission */}
              {canEditUser && (
                <IconButton onClick={() => handleEdit(user)}>
                  <Edit />
                </IconButton>
              )}

              {/* Manage Permissions - only if has permission */}
              {canManagePermissions && (
                <IconButton onClick={() => handleManagePermissions(user)}>
                  <VpnKey />
                </IconButton>
              )}

              {/* Approve - only if has permission AND user is not active */}
              {canApproveUser && user.status !== "active" && (
                <IconButton onClick={() => approveUser(user.id)}>
                  <Check />
                </IconButton>
              )}

              {/* Suspend - only if has permission AND user is active */}
              {canSuspendUser && user.status === "active" && (
                <IconButton onClick={() => suspendUser(user.id)}>
                  <Block />
                </IconButton>
              )}

              {/* Delete - only if has permission */}
              {canDeleteUser && (
                <IconButton onClick={() => handleDelete(user)}>
                  <Delete />
                </IconButton>
              )}
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
};
```

## Example: Admin Panel Sidebar

Here's how the Admin Panel sidebar hides menu items based on permissions:

```tsx
// AdminPanel.tsx
import { usePermission } from "../../hooks/usePermission";

const AdminPanel = () => {
  // Permission checks for each menu item - requires specific permissions
  const canManageUsers = usePermission(["users.view", "users.manage"]);
  const canVerifyUsers = usePermission(["users.verify"]);
  const canManageRoles = usePermission([
    "roles.view",
    "roles.create",
    "roles.edit",
    "roles.delete",
    "roles.assign",
  ]);
  const canManagePermissions = usePermission([
    "permissions.view",
    "permissions.create",
    "permissions.edit",
    "permissions.delete",
    "permissions.grant",
    "permissions.deny",
  ]);

  const allMenuItems = [
    {
      path: "/admin/users",
      label: "User Management",
      icon: <People />,
      visible: canManageUsers, // Only show if user has permission
    },
    {
      path: "/admin/verification",
      label: "User Verification",
      icon: <VerifiedUser />,
      visible: canVerifyUsers,
    },
    {
      path: "/admin/roles",
      label: "Role Management",
      icon: <AdminPanelSettings />,
      visible: canManageRoles,
    },
    {
      path: "/admin/permissions",
      label: "Permission Management",
      icon: <Security />,
      visible: canManagePermissions,
    },
  ];

  // Filter menu items - only show visible items
  const menuItems = allMenuItems.filter((item) => item.visible);

  return (
    <List>
      {menuItems.map((item) => (
        <ListItemButton key={item.path} component={Link} to={item.path}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText>{item.label}</ListItemText>
        </ListItemButton>
      ))}
    </List>
  );
};
```

## Debugging

### Check User Permissions

Open browser console and run:

```javascript
// Get current user permissions
useAuthStore.getState().permissions;

// Check specific permission
useAuthStore.getState().hasPermission("donations.view");

// Check if user has all permissions
useAuthStore.getState().hasAllPermissions("users.edit", "users.delete");
```

### Permission Not Working?

1. **Verify permission exists in backend** - Check seed permissions
2. **Check user's role** - Ensure role has the permission
3. **Check user overrides** - User might have permission denied
4. **Refresh token** - Log out and log back in to get updated permissions
5. **Console log** - Add `console.log(permissions)` to see current permissions

## Adding New Permissions

1. **Backend**: Add to `backend/src/config/seedPermissions.ts`
2. **Backend**: Restart server to run seeds
3. **Backend**: Add permission check to route with `requirePermission`
4. **Frontend**: Add route guard with `PermissionGuard`
5. **Frontend**: Hide UI elements with `usePermission` hook
6. **Test**: Verify with different user roles

## Support

For questions or issues with the permission system, check:

- `frontend/src/stores/authStore.ts` - Permission store implementation
- `frontend/src/components/auth/PermissionGuard.tsx` - Route protection
- `frontend/src/hooks/usePermission.tsx` - Hook implementation
- `backend/src/shared/middleware/permission.middleware.ts` - Backend checks
