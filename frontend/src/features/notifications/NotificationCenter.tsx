import { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  alpha,
  Paper,
} from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUnreadNotifications,
  getUnreadCount,
  markNotificationsAsRead,
  type Notification,
} from "../../shared/services/notificationService";

export const NotificationCenter = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch unread count on mount and window focus
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: getUnreadCount,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // Fetch unread notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: () => getUnreadNotifications(10),
    enabled: Boolean(anchorEl), // Only fetch when popover is open
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Listen for real-time notifications from WebSocket
  const {
    notifications: wsNotifications,
    unreadCount: wsUnreadCount,
    markAllAsRead,
  } = useWebSocket();

  // Refetch count and notifications when new WebSocket notification arrives
  useEffect(() => {
    if (wsNotifications.length > 0) {
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  }, [wsNotifications, queryClient]);

  // Use WebSocket count if available, otherwise use API count
  const displayCount = wsUnreadCount > 0 ? wsUnreadCount : unreadCount;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // Reset WebSocket count when opening popover
    markAllAsRead();
    // Refetch notifications when popover opens
    queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate([notification._id]);
    }

    // Handle navigation based on notification type
    if (notification.type === "profile_completion") {
      // Navigate to admin verification page
      navigate(`/admin/verification`);
      handleClose();
    } else if (notification.data?.donationId) {
      // Navigate to donation details
      navigate(`/donations/${notification.data.donationId}`);
      handleClose();
    }
  };

  const handleViewAll = () => {
    navigate("/notifications");
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: "text.primary",
          "&:hover": { bgcolor: alpha("#359364", 0.08) },
        }}
      >
        <Badge badgeContent={displayCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Paper sx={{ width: 360 }}>
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {t("nav.notifications")}
            </Typography>
            {notifications.length > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                {t("notifications.markAllRead")}
              </Button>
            )}
          </Box>

          <Divider />

          {notifications.length === 0 ? (
            <>
              <Box sx={{ p: 3, textAlign: "center" }}>
                <NotificationsIcon
                  sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("notifications.noNew")}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  onClick={handleViewAll}
                  sx={{
                    color: "primary.main",
                    cursor: "pointer",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {t("notifications.viewAll")}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <List sx={{ p: 0, maxHeight: 400, overflowY: "auto", overflowX: "hidden" }}>
                {notifications.map((notification) => (
                  <Box key={notification._id}>
                    <ListItem
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: alpha("#1976d2", 0.05),
                        },
                        bgcolor: notification.isRead
                          ? "transparent"
                          : alpha("#359364", 0.05),
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
              </List>
              <Box sx={{ p: 2, textAlign: "center", borderTop: "1px solid", borderColor: "divider" }}>
                <Typography
                  variant="body2"
                  onClick={handleViewAll}
                  sx={{
                    color: "primary.main",
                    cursor: "pointer",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {t("notifications.viewAll")}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Popover>
    </>
  );
};
