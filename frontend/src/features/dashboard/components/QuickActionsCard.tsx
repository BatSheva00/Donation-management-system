import { Card, CardContent, Box, Typography, alpha } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../shared/stores/authStore";

interface QuickActionsCardProps {
  t: any;
}

export const QuickActionsCard = ({ t }: QuickActionsCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const roleKey = user?.role?.key;

  const actions = [
    { 
      label: t("dashboard.myDonations") || "My Donations", 
      color: "#359364",
      path: "/my-donations",
      show: true,
    },
    { 
      label: t("dashboard.myRequests") || "My Requests", 
      color: "#f97316",
      path: "/my-requests",
      show: true,
    },
    { 
      label: t("dashboard.myDeliveries") || "My Deliveries", 
      color: "#3b82f6",
      path: "/my-deliveries",
      show: roleKey === "driver",
    },
  ].filter(action => action.show);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <CalendarToday color="primary" />
          <Typography variant="h6" component="h2" fontWeight={600}>
            {t("dashboard.quickActions")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {actions.map((action, index) => (
            <Box
              key={index}
              onClick={() => navigate(action.path)}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "2px solid",
                borderColor: alpha(action.color, 0.2),
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: action.color,
                  bgcolor: alpha(action.color, 0.05),
                  transform: "translateX(4px)",
                },
              }}
            >
              <Typography variant="body1" fontWeight={600} color={action.color}>
                {action.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
