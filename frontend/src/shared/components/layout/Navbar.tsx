import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  Avatar,
  useScrollTrigger,
  Slide,
  alpha,
} from "@mui/material";
import {
  Language as LanguageIcon,
  Logout,
  Dashboard as DashboardIcon,
  Favorite,
  KeyboardArrowDown,
  AdminPanelSettings,
  Person,
  Assignment,
  CardGiftcard,
} from "@mui/icons-material";
import { useAuthStore } from "../../stores/authStore";
import { usePermission } from "../../hooks/usePermission";
import { getProfileImageUrl, getUserInitials, isUserVerified } from "../../../utils/userUtils";
import { NotificationCenter } from "../../../features/notifications/NotificationCenter";
import UserAvatar from "../shared/UserAvatar";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { DonateButton } from "../../../features/payments/components/DonateButton";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, clearAuth, hasPermission } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  
  // Initialize WebSocket for notifications
  useWebSocket();

  const trigger = useScrollTrigger();

  // Calculate permissions - will re-render when permissions change
  const isAdmin = hasPermission("system.admin", "users.manage");
  const canViewDonations = usePermission([
    "donations.view",
    "donations.view.own",
  ]);
  const canViewRequests = usePermission(["requests.view", "requests.view.own"]);
  const canViewDeliveries = usePermission(["deliveries.view"]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLangMenu = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setLangAnchorEl(null);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    handleClose();
  };

  const handleLogout = () => {
    clearAuth();
    handleClose();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha("#ffffff", 0.95),
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1 }}>
            <Box
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
                flexGrow: { xs: 1, md: 0 },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                  boxShadow: "0 4px 12px rgba(53, 147, 100, 0.3)",
                }}
                aria-hidden="true"
              >
                <Favorite sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 800,
                  color: "primary.main",
                  display: { xs: "none", sm: "block" },
                }}
              >
                KindLoop
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    to="/dashboard"
                    startIcon={<DashboardIcon />}
                    sx={{
                      color: isActive("/dashboard")
                        ? "primary.main"
                        : "text.primary",
                      fontWeight: isActive("/dashboard") ? 600 : 500,
                      display: { xs: "none", md: "flex" },
                      "&:hover": { bgcolor: alpha("#359364", 0.08) },
                    }}
                  >
                    {t("nav.dashboard")}
                  </Button>

                  {canViewDonations && (
                    <Button
                      component={Link}
                      to="/donations"
                      sx={{
                        color: isActive("/donations")
                          ? "primary.main"
                          : "text.primary",
                        fontWeight: isActive("/donations") ? 600 : 500,
                        display: { xs: "none", md: "flex" },
                        "&:hover": { bgcolor: alpha("#359364", 0.08) },
                      }}
                    >
                      {t("nav.donations")}
                    </Button>
                  )}

                  {canViewRequests && (
                    <Button
                      component={Link}
                      to="/requests"
                      sx={{
                        color: isActive("/requests")
                          ? "primary.main"
                          : "text.primary",
                        fontWeight: isActive("/requests") ? 600 : 500,
                        display: { xs: "none", md: "flex" },
                        "&:hover": { bgcolor: alpha("#359364", 0.08) },
                      }}
                    >
                      {t("nav.requests")}
                    </Button>
                  )}

                  {canViewDeliveries && (
                    <Button
                      component={Link}
                      to="/deliveries"
                      sx={{
                        color: isActive("/deliveries")
                          ? "primary.main"
                          : "text.primary",
                        fontWeight: isActive("/deliveries") ? 600 : 500,
                        display: { xs: "none", md: "flex" },
                        "&:hover": { bgcolor: alpha("#359364", 0.08) },
                      }}
                    >
                      {t("nav.deliveries") || "Deliveries"}
                    </Button>
                  )}

                  {/* Notification Center */}
                  <NotificationCenter />

                  {/* Donate Button */}
                  <DonateButton
                    size="small"
                    sx={{ display: { xs: "none", md: "flex" } }}
                  />

                  <Button
                    onClick={handleMenu}
                    endIcon={<KeyboardArrowDown />}
                    aria-label={t("accessibility.userMenu")}
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorEl)}
                    sx={{
                      color: "text.primary",
                      textTransform: "none",
                      "&:hover": { bgcolor: alpha("#359364", 0.08) },
                    }}
                  >
                    <Box sx={{ mr: 1 }}>
                      <UserAvatar
                        src={getProfileImageUrl(user) || undefined}
                        initials={getUserInitials(user)}
                        size={40}
                        isVerified={isUserVerified(user)}
                        sx={{
                          bgcolor: "primary.main",
                          color: "white",
                          fontSize: "1rem",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: { xs: "none", sm: "block" },
                        textAlign: "left",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, lineHeight: 1.2 }}
                      >
                        {user?.firstName} {user?.lastName}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", lineHeight: 1 }}
                      >
                        {user?.role?.name || user?.role?.key}
                      </Typography>
                    </Box>
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    aria-label="User menu"
                    disableScrollLock
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <MenuItem
                      component={Link}
                      to="/dashboard"
                      onClick={handleClose}
                    >
                      <DashboardIcon sx={{ mr: 2 }} fontSize="small" />
                      {t("nav.dashboard")}
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/profile"
                      onClick={handleClose}
                    >
                      <Person sx={{ mr: 2 }} fontSize="small" />
                      {t("nav.profile")}
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/my-requests"
                      onClick={handleClose}
                    >
                      <Assignment sx={{ mr: 2 }} fontSize="small" />
                      {t("nav.myRequests") || "My Requests"}
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/my-fulfilled-requests"
                      onClick={handleClose}
                    >
                      <CardGiftcard sx={{ mr: 2 }} fontSize="small" />
                      {t("nav.myFulfilledRequests") || "My Fulfilled Requests"}
                    </MenuItem>
                    {isAdmin && (
                      <MenuItem
                        component={Link}
                        to="/admin"
                        onClick={handleClose}
                      >
                        <AdminPanelSettings sx={{ mr: 2 }} fontSize="small" />
                        {t("admin.panelTitle")}
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>
                      <Logout sx={{ mr: 2 }} fontSize="small" />
                      {t("common.logout")}
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      "&:hover": { bgcolor: alpha("#359364", 0.08) },
                    }}
                  >
                    {t("common.login")}
                  </Button>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/register"
                    sx={{
                      background:
                        "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                      boxShadow: "0 4px 12px rgba(53, 147, 100, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #24754f 0%, #1a5a3d 100%)",
                        boxShadow: "0 6px 16px rgba(53, 147, 100, 0.4)",
                      },
                    }}
                  >
                    {t("common.register")}
                  </Button>
                </>
              )}

              <IconButton
                onClick={handleLangMenu}
                aria-label={t("accessibility.toggleLanguage")}
                aria-haspopup="true"
                aria-expanded={Boolean(langAnchorEl)}
                sx={{
                  ml: 1,
                  color: "text.primary",
                  "&:hover": { bgcolor: alpha("#359364", 0.08) },
                }}
              >
                <LanguageIcon />
              </IconButton>
              <Menu
                anchorEl={langAnchorEl}
                open={Boolean(langAnchorEl)}
                onClose={handleClose}
                aria-label="Language selection"
                disableScrollLock
                PaperProps={{
                  sx: {
                    mt: 1,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    minWidth: 150,
                  },
                }}
              >
                <MenuItem
                  onClick={() => handleLanguageChange("en")}
                  selected={i18n.language === "en"}
                  sx={{
                    direction: "ltr",
                    justifyContent: "flex-start",
                  }}
                >
                  🇺🇸 English
                </MenuItem>
                <MenuItem
                  onClick={() => handleLanguageChange("he")}
                  selected={i18n.language === "he"}
                  sx={{
                    direction: "rtl",
                    justifyContent: "flex-start",
                  }}
                >
                  🇮🇱 עברית
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Slide>
  );
};

export default Navbar;
