import api from "../../lib/axios";

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

/**
 * Get all notifications with pagination
 */
export const getNotifications = async (
  page = 1,
  limit = 20,
  isRead?: boolean
): Promise<NotificationsResponse> => {
  const params: Record<string, string | number> = { page, limit };
  if (isRead !== undefined) {
    params.isRead = isRead.toString();
  }

  const response = await api.get("/notifications", { params });
  return response.data;
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<UnreadCountResponse>("/notifications/unread/count");
  return response.data.data.count;
};

/**
 * Get recent unread notifications
 */
export const getUnreadNotifications = async (limit = 10): Promise<Notification[]> => {
  const response = await api.get("/notifications/unread", { params: { limit } });
  return response.data.data;
};

/**
 * Mark specific notifications as read
 */
export const markNotificationsAsRead = async (notificationIds: string[]): Promise<void> => {
  await api.patch("/notifications/mark-read", { notificationIds });
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
  await api.patch("/notifications/mark-all-read");
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

/**
 * Delete all read notifications
 */
export const deleteAllReadNotifications = async (): Promise<void> => {
  await api.delete("/notifications/read/all");
};

