import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markNotificationsAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  type Notification,
} from "../../shared/services/notificationService";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

export const NotificationsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"all" | "unread" | "read">("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch notifications
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications", tab, page],
    queryFn: () => {
      const isRead = tab === "read" ? true : tab === "unread" ? false : undefined;
      return getNotifications(page, limit, isRead);
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  // Delete all read mutation
  const deleteAllReadMutation = useMutation({
    mutationFn: deleteAllReadNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: "all" | "unread" | "read") => {
    setTab(newValue);
    setPage(1);
  };

  const handleMarkAsRead = (notificationIds: string[]) => {
    markAsReadMutation.mutate(notificationIds);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      handleMarkAsRead([notification._id]);
    }

    // Handle navigation based on notification type
    if (notification.type === "profile_completion") {
      // Navigate to admin verification page
      navigate(`/admin/verification`);
    } else if (notification.data?.donationId) {
      // Navigate to donation details
      navigate(`/donations/${notification.data.donationId}`);
    }
  };

  const getNotificationIcon = (type: string) => {    // _type parameter is intentionally prefixed to avoid shadowing    return <NotificationsIcon color="primary" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            {t("notifications.title", "Notifications")}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<DoneAllIcon />}
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || data?.unreadCount === 0}
            >
              {t("notifications.markAllRead", "Mark All Read")}
            </Button>
            <Button
              startIcon={<DeleteSweepIcon />}
              onClick={() => deleteAllReadMutation.mutate()}
              disabled={deleteAllReadMutation.isPending}
              color="error"
            >
              {t("notifications.deleteAllRead", "Delete All Read")}
            </Button>
          </Stack>
        </Stack>

        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{t("notifications.all", "All")}</span>
                {data && <Chip label={data.pagination.total} size="small" />}
              </Stack>
            }
            value="all"
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{t("notifications.unread", "Unread")}</span>
                {data && data.unreadCount > 0 && (
                  <Chip label={data.unreadCount} size="small" color="primary" />
                )}
              </Stack>
            }
            value="unread"
          />
          <Tab label={t("notifications.read", "Read")} value="read" />
        </Tabs>

        {isLoading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t("notifications.error", "Failed to load notifications")}
          </Alert>
        )}

        {data && data.data.length === 0 && (
          <Alert severity="info">
            {t("notifications.empty", "No notifications")}
          </Alert>
        )}

        {data && data.data.length > 0 && (
          <>
            <List>
              {data.data.map((notification: Notification) => (
                <ListItem
                  key={notification._id}
                  sx={{
                    bgcolor: notification.isRead ? "transparent" : "action.hover",
                    borderRadius: 1,
                    mb: 1,
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.selected",
                    },
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      {!notification.isRead && (
                        <IconButton
                          edge="end"
                          onClick={() => handleMarkAsRead([notification._id])}
                          title={t("notifications.markRead", "Mark as read")}
                        >
                          <DoneAllIcon />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(notification._id)}
                        color="error"
                        title={t("notifications.delete", "Delete")}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemIcon>
                    {!notification.isRead && (
                      <CircleIcon color="primary" sx={{ fontSize: 12, mr: 1 }} />
                    )}
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: isRTL ? he : undefined,
                          })}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {data.pagination.pages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={data.pagination.pages}
                  page={page}
                  onChange={(_e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

