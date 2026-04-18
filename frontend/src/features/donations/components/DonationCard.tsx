import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  Stack,
  alpha,
} from "@mui/material";
import {
  LocationOn,
  CalendarToday,
  Inventory,
  Person,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Donation } from "../types/donation.types";
import { getProfileImageUrl, getUserInitials, isUserVerified } from "../../../utils/userUtils";
import UserAvatar from "../../../shared/components/shared/UserAvatar";

interface DonationCardProps {
  donation: Donation;
}

export const DonationCard = ({ donation }: DonationCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#f59e0b",
      approved: "#10b981",
      assigned: "#3b82f6",
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
      other: "#6b7280",
    };
    return colors[category] || "#6b7280";
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
      {donation.images && donation.images.length > 0 ? (
        <CardMedia
          component="img"
          height="200"
          image={donation.images[0]}
          alt={donation.title}
        />
      ) : (
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
      )}
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip
              label={donation.type}
              size="small"
              sx={{
                bgcolor: alpha(getCategoryColor(donation.type), 0.1),
                color: getCategoryColor(donation.type),
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            />
            <Chip
              label={donation.status.replace(/_/g, " ")}
              size="small"
              sx={{
                bgcolor: alpha(getStatusColor(donation.status), 0.1),
                color: getStatusColor(donation.status),
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            />
          </Stack>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {donation.title}
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
            {donation.description}
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Inventory fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {donation.quantity} {donation.unit}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {donation.pickupLocation.city}
            </Typography>
          </Box>
          {donation.expiryDate && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {new Date(donation.expiryDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: "auto",
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UserAvatar
              src={getProfileImageUrl(donation.donorId) || undefined}
              initials={getUserInitials(donation.donorId)}
              size={32}
              isVerified={isUserVerified(donation.donorId)}
            />
            <Typography variant="body2" fontWeight={600}>
              {donation.donorId.firstName} {donation.donorId.lastName}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            size="small"
            onClick={() => navigate(`/donations/${donation._id}`)}
          >
            {t("donations.viewDetails") || "View Details"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

