import api from "../../lib/axios";

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role:
    | string
    | { _id: string; name: string; key: string; description: string }; // Can be string or role object
  status: string;
  language: string;
  isEmailVerified: boolean;
  permissions?: string[]; // Flattened permissions array from /me endpoint
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  _id: string;
  name: string;
  key: string;
  description: string;
  category: string;
  isActive: boolean;
}

export interface Role {
  _id: string;
  name: string;
  key: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  isSystemRole: boolean;
}

// User Management
export const getAllUsers = async (params?: {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get("/users", { params });
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data.data; // Backend returns { success: true, data: user }
};

export const createUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
  status?: string;
  phone?: string;
  language?: string;
}) => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const updateUser = async (id: string, userData: Partial<User>) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const approveUser = async (id: string) => {
  const response = await api.put(`/users/${id}/approve`);
  return response.data;
};

export const rejectUser = async (id: string, reason: string) => {
  const response = await api.put(`/users/${id}/reject`, { reason });
  return response.data;
};

export const suspendUser = async (id: string, reason?: string) => {
  const response = await api.put(`/users/${id}/suspend`, { reason });
  return response.data;
};

export const updateUserPassword = async (id: string, password: string) => {
  const response = await api.put(`/users/${id}/password`, { password });
  return response.data;
};

export const bulkUpdateUsers = async (
  userIds: string[],
  updates: Partial<User>
) => {
  const response = await api.post("/users/bulk-update", { userIds, updates });
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get("/users/stats");
  return response.data;
};

// Permission Management
export const getAllPermissions = async (params?: {
  category?: string;
  isActive?: boolean;
}) => {
  const response = await api.get("/permissions", { params });
  return response.data;
};

export const getPermissionsByCategory = async () => {
  const response = await api.get("/permissions/by-category");
  return response.data;
};

export const createPermission = async (permissionData: {
  name: string;
  key: string;
  description: string;
  category: string;
  isActive?: boolean;
}) => {
  const response = await api.post("/permissions", permissionData);
  return response.data;
};

export const updatePermission = async (
  id: string,
  permissionData: Partial<Permission>
) => {
  const response = await api.put(`/permissions/${id}`, permissionData);
  return response.data;
};

export const deletePermission = async (id: string) => {
  const response = await api.delete(`/permissions/${id}`);
  return response.data;
};

export const grantPermissionToUser = async (
  userId: string,
  permissionId: string
) => {
  const response = await api.post("/permissions/grant-to-user", {
    userId,
    permissionId,
  });
  return response.data;
};

export const denyPermissionToUser = async (
  userId: string,
  permissionId: string
) => {
  const response = await api.post("/permissions/deny-to-user", {
    userId,
    permissionId,
  });
  return response.data;
};

export const removeUserPermissionOverride = async (
  userId: string,
  permissionId: string
) => {
  const response = await api.post("/permissions/remove-user-override", {
    userId,
    permissionId,
  });
  return response.data;
};

export const getUserPermissions = async (userId: string) => {
  const response = await api.get(`/permissions/user/${userId}`);
  return response.data;
};

export const bulkUpdateUserPermissions = async (
  userId: string,
  permissionsGranted: string[],
  permissionsDenied: string[]
) => {
  const response = await api.post("/permissions/bulk-update-user", {
    userId,
    permissionsGranted,
    permissionsDenied,
  });
  return response.data;
};

// Role Management
export const getAllRoles = async (params?: { isActive?: boolean }) => {
  const response = await api.get("/roles", { params });
  return response.data;
};

export const getRoleById = async (id: string) => {
  const response = await api.get(`/roles/${id}`);
  return response.data;
};

export const createRole = async (roleData: {
  name: string;
  key: string;
  description: string;
  permissions: string[];
  isActive?: boolean;
  isSystemRole?: boolean;
}) => {
  const response = await api.post("/roles", roleData);
  return response.data;
};

export const updateRole = async (id: string, roleData: Partial<Role>) => {
  const response = await api.put(`/roles/${id}`, roleData);
  return response.data;
};

export const deleteRole = async (id: string) => {
  const response = await api.delete(`/roles/${id}`);
  return response.data;
};

export const addPermissionToRole = async (
  roleId: string,
  permissionId: string
) => {
  const response = await api.post("/roles/add-permission", {
    roleId,
    permissionId,
  });
  return response.data;
};

export const removePermissionFromRole = async (
  roleId: string,
  permissionId: string
) => {
  const response = await api.post("/roles/remove-permission", {
    roleId,
    permissionId,
  });
  return response.data;
};

export const assignRoleToUser = async (userId: string, roleId: string) => {
  const response = await api.post("/roles/assign-to-user", { userId, roleId });
  return response.data;
};

// Get current user (me endpoint)
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateUserProfile = async (
  id: string,
  profileData: any,
  requiresReview: boolean = true
) => {
  const response = await api.put(`/users/${id}/profile`, {
    ...profileData,
    requiresReview,
  });
  return response.data;
};

export const uploadDocument = async (file: File, type: string) => {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("type", type);
  const response = await api.post("/upload/document", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteDocument = async (userId: string, documentId: string) => {
  const response = await api.delete(`/users/${userId}/documents/${documentId}`);
  return response.data;
};
