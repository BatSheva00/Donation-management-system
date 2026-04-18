import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
  alpha,
} from "@mui/material";
import {
  LocationOn,
  CalendarToday,
  Inventory,
  LocalShipping,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IRequest } from "../types/request.types";
import UserAvatar from "../../../shared/components/shared/UserAvatar";

interface RequestCardProps {
  request: IRequest;
}

export const RequestCard = ({ request }: RequestCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#f59e0b",
      approved: "#10b981",
      fulfilled: "#3b82f6",
      waiting_for_delivery: "#8b5cf6",
      in_transit: "#8b5cf6",
      delivered: "#10b981",
      completed: "#6b7280",
      cancelled: "#ef4444",
      rejected: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: "#10b981",
      clothing: "#8b5cf6",
      electronics: "#f59e0b",
      furniture: "#3b82f6",
      books: "#ec4899",
      toys: "#f97316",
      medical: "#ef4444",
      other: "#6b7280",
    };
    return colors[category] || "#6b7280";
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      low: "#10b981",
      medium: "#f59e0b",
      high: "#ef4444",
    };
    return colors[urgency] || "#6b7280";
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Box
        sx={{
          height: 200,
          bgcolor: alpha("#359364", 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Inventory sx={{ fontSize: 64, color: "#359364" }} />
      </Box>
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap", gap: 0.5 }}>
            <Chip
              label={request.category}
              size="small"
              sx={{
                bgcolor: alpha(getCategoryColor(request.category), 0.1),
                color: getCategoryColor(request.category),
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            />
            <Chip
              label={request.urgency}
              size="small"
              sx={{
                bgcolor: alpha(getUrgencyColor(request.urgency), 0.1),
                color: getUrgencyColor(request.urgency),
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            />
            {request.needsDelivery && (
              <Chip
                icon={<LocalShipping sx={{ fontSize: 16 }} />}
                label={t("requests.needsDelivery") || "Needs Delivery"}
                size="small"
                sx={{
                  bgcolor: alpha("#3b82f6", 0.1),
                  color: "#3b82f6",
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {request.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {request.description}
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ mb: 2 }}>
          {request.quantity && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Inventory fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {t("requests.quantity")}: {request.quantity}
              </Typography>
            </Box>
          )}
          {request.needsDelivery && request.deliveryAddress && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {request.deliveryAddress.street}, {request.deliveryAddress.city}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarToday fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {new Date(request.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            mt: "auto",
            pt: 2,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UserAvatar
              initials={`${request.requesterId.firstName?.charAt(0) || ''}${request.requesterId.lastName?.charAt(0) || ''}`}
              sx={{ width: 32, height: 32 }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("requests.requestedBy") || "Requested by"}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {request.requesterId.firstName} {request.requesterId.lastName}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate(`/requests/${request._id}`)}
          >
            {t("common.viewDetails") || "View"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
