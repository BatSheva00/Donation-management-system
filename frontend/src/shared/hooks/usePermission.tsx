import React from "react";
import { useAuthStore } from "../stores/authStore";

/**
 * Custom hook for permission-based conditional rendering
 *
 * @example
 * const canViewDonations = usePermission('donations.view');
 * const canManageUsers = usePermission(['users.edit', 'users.delete'], true); // requires ALL
 *
 * if (!canViewDonations) return null;
 */
export const usePermission = (
  permissions: string | string[],
  requireAll = false
): boolean => {
  const { hasPermission, hasAllPermissions } = useAuthStore();

  const permArray = Array.isArray(permissions) ? permissions : [permissions];

  return requireAll
    ? hasAllPermissions(...permArray)
    : hasPermission(...permArray);
};

/**
 * Component wrapper for permission-based conditional rendering
 *
 * @example
 * <PermissionWrapper requiredPermissions={['donations.view']}>
 *   <DonationsButton />
 * </PermissionWrapper>
 */
export const PermissionWrapper = ({
  children,
  requiredPermissions,
  requireAll = false,
  fallback = null,
}: {
  children: React.ReactNode;
  requiredPermissions: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}) => {
  const hasAccess = usePermission(requiredPermissions, requireAll);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
