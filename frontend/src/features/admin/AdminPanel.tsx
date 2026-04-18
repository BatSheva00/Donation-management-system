import {
  Box,
  Container,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
  Chip,
  Divider,
} from "@mui/material";
import {
  People,
  Security,
  AdminPanelSettings,
  VerifiedUser,
  Dashboard as DashboardIcon,
  AccountBalance,
  CheckCircle,
  Favorite,
  Assignment,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { usePermission } from "../../shared/hooks/usePermission";

const AdminPanel = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Permission checks - users need specific permissions for each section
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
  const canManageDonations = usePermission(["donations.approve", "donations.delete"]);
  const canManageRequests = usePermission(["requests.approve", "requests.delete"]);
  const canViewTransactions = usePermission(["system.admin"]); // Admin only
  const canViewActivities = usePermission(["system.admin"]); // Admin only

  const allMenuItems = [
    {
      path: "/admin/users",
      label: t("admin.userManagement"),
      icon: <People />,
      visible: canManageUsers,
      description: t("admin.manageSystemUsers"),
    },
    {
      path: "/admin/verification",
      label: t("admin.userVerification"),
      icon: <VerifiedUser />,
      visible: canVerifyUsers,
      description: t("admin.verifyAndApproveUsers"),
    },
    {
      path: "/admin/donations",
      label: "Donation Management",
      icon: <Favorite />,
      visible: canManageDonations,
      description: "Manage and approve donation requests",
    },
    {
      path: "/admin/requests",
      label: "Request Management",
      icon: <Assignment />,
      visible: canManageRequests,
      description: "Manage donation requests from users",
    },
    {
      path: "/admin/roles",
      label: t("admin.roleManagement"),
      icon: <AdminPanelSettings />,
      visible: canManageRoles,
      description: t("admin.manageUserRoles"),
    },
    {
      path: "/admin/permissions",
      label: t("admin.permissionManagement"),
      icon: <Security />,
      visible: canManagePermissions,
      description: t("admin.manageAccessRights"),
    },
    {
      path: "/admin/transactions",
      label: t("admin.transactionManagement"),
      icon: <AccountBalance />,
      visible: canViewTransactions,
      description: t("admin.viewFinancialActivity"),
    },
    {
      path: "/admin/activities",
      label: t("admin.activityManagement") || "Activity Management",
      icon: <DashboardIcon />,
      visible: canViewActivities,
      description: t("admin.viewAllUserActivities") || "View all user activities",
    },
  ];

  // Filter menu items based on permissions
  const menuItems = allMenuItems.filter((item) => item.visible);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Enhanced Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "40%",
            height: "100%",
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 70%)",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              }}
            >
              <DashboardIcon sx={{ color: "white", fontSize: 32 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
                {t("admin.panelTitle")}
              </Typography>
              <Typography
                variant="body1"
                sx={{ opacity: 0.9, fontSize: "1.05rem" }}
              >
                {t("admin.panelSubtitle")}
              </Typography>
            </Box>
            <Chip
              icon={<CheckCircle sx={{ color: "white !important" }} />}
              label={t("admin.allSystemsOperational")}
              sx={{
                bgcolor: "rgba(16, 185, 129, 0.9)",
                color: "white",
                fontWeight: 600,
                px: 1,
                "& .MuiChip-icon": {
                  color: "white",
                },
              }}
            />
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Enhanced Sidebar Navigation */}
        <Paper
          elevation={0}
          sx={{
            width: 320,
            height: "fit-content",
            position: "sticky",
            top: 100,
            p: 2.5,
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid",
            borderColor: alpha("#000", 0.08),
          }}
        >
          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              letterSpacing: 1.2,
              px: 2,
              mb: 1,
              display: "block",
            }}
          >
            {t("admin.tabsLabel")}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <List sx={{ p: 0 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItemButton
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    p: 2,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    "&.Mui-selected": {
                      bgcolor: alpha("#3b82f6", 0.08),
                      color: "#1e40af",
                      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.15)",
                      "& .MuiListItemIcon-root": {
                        color: "#3b82f6",
                        transform: "scale(1.1)",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 4,
                        height: "60%",
                        bgcolor: "#3b82f6",
                        borderRadius: "0 4px 4px 0",
                      },
                      "&:hover": {
                        bgcolor: alpha("#3b82f6", 0.12),
                      },
                    },
                    "&:hover": {
                      bgcolor: alpha("#3b82f6", 0.04),
                      transform: "translateX(4px)",
                      "& .MuiListItemIcon-root": {
                        transform: "scale(1.05)",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 48,
                      color: isActive ? "#3b82f6" : "text.secondary",
                      transition: "all 0.3s",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 700 : 600,
                      fontSize: "0.95rem",
                      color: isActive ? "#1e40af" : "text.primary",
                    }}
                    secondaryTypographyProps={{
                      fontSize: "0.75rem",
                      mt: 0.5,
                      sx: {
                        display: isActive ? "block" : "none",
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>

          {/* Enhanced System Status */}
          <Box
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                opacity: 0.9,
                display: "block",
                mb: 1.5,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {t("admin.systemStatus")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "white",
                  boxShadow: "0 0 12px rgba(255,255,255,0.6)",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  "@keyframes pulse": {
                    "0%, 100%": {
                      opacity: 1,
                      transform: "scale(1)",
                    },
                    "50%": {
                      opacity: 0.7,
                      transform: "scale(1.1)",
                    },
                  },
                }}
              />
              <Typography variant="body2" fontWeight={700}>
                {t("admin.allSystemsOperational")}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Container>
  );
};

export default AdminPanel;
