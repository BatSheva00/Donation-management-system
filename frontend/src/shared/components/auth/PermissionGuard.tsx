import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../../shared/stores/authStore";
import { Box, Typography, Button, Container, alpha } from "@mui/material";
import { Lock } from "@mui/icons-material";
import { Link } from "react-router-dom";

interface PermissionGuardProps {
  children?: ReactNode;
  requiredPermissions?: string[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs at least ONE
  fallback?: ReactNode;
}

const PermissionGuard = ({
  children,
  requiredPermissions = [],
  requireAll = false,
  fallback,
}: PermissionGuardProps) => {
  const { isAuthenticated, hasPermission, hasAllPermissions } = useAuthStore();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no permissions required, render children or outlet
  if (requiredPermissions.length === 0) {
    return children ? <>{children}</> : <Outlet />;
  }

  // Check permissions
  const hasAccess = requireAll
    ? hasAllPermissions(...requiredPermissions)
    : hasPermission(...requiredPermissions);

  // If user doesn't have permission, show fallback or default message
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            py: 8,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: alpha("#f97316", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Lock sx={{ fontSize: 40, color: "#f97316" }} />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You don't have permission to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Required permissions: {requiredPermissions.join(", ")}
          </Typography>
          <Button
            component={Link}
            to="/dashboard"
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  // Render children if provided (for wrapping components), otherwise render Outlet (for route layouts)
  return children ? <>{children}</> : <Outlet />;
};

export default PermissionGuard;
