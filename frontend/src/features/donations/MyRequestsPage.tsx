import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Avatar,
} from "@mui/material";
import { ShoppingBag, LocationOn, CalendarToday, Person } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { Donation, DonationStatus } from "./types/donation.types";
import { formatDistanceToNow } from "date-fns";
import { getUserInitials, getProfileImageUrl } from "../../utils/userUtils";

const MyRequestsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch donations I've requested (no cache - always fresh data)
  const { data, isLoading } = useQuery({
    queryKey: ["my-requests"],
    queryFn: async () => {
      const response = await api.get("/donations?requestedByMe=true");
      return response.data.data;
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const requests: Donation[] = data || [];

  // Filter by status
  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((d) => d.status === statusFilter);

  // Count by status
  const counts = {
    all: requests.length,
    requested: requests.filter((d) => d.status === DonationStatus.REQUESTED).length,
    approved: requests.filter((d) => d.status === DonationStatus.APPROVED).length,
    in_transit: requests.filter((d) => d.status === DonationStatus.IN_TRANSIT).length,
    delivered: requests.filter((d) => d.status === DonationStatus.DELIVERED).length,
    completed: requests.filter((d) => d.status === DonationStatus.COMPLETED).length,
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <ShoppingBag sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h4" fontWeight={700}>
            {t("myRequests.title") || "My Requests"}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {t("myRequests.subtitle") || "Track donations you've requested"}
        </Typography>
      </Box>

      {/* Status Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All (${counts.all})`} value="all" />
          <Tab label={`Pending Approval (${counts.requested})`} value={DonationStatus.REQUESTED} />
          <Tab label={`Approved (${counts.approved})`} value={DonationStatus.APPROVED} />
          <Tab label={`In Transit (${counts.in_transit})`} value={DonationStatus.IN_TRANSIT} />
          <Tab label={`Delivered (${counts.delivered})`} value={DonationStatus.DELIVERED} />
          <Tab label={`Completed (${counts.completed})`} value={DonationStatus.COMPLETED} />
        </Tabs>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && filteredRequests.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          <ShoppingBag sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("myRequests.noRequests") || "No requests found"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusFilter === "all"
              ? t("myRequests.browseFirst") || "Browse donations and request what you need"
              : t("myRequests.noInStatus") || "No requests in this status"}
          </Typography>
        </Box>
      )}

      {/* Requests Grid */}
      {!isLoading && filteredRequests.length > 0 && (
        <Grid container spacing={3}>
          {filteredRequests.map((donation) => (
            <Grid item xs={12} sm={6} md={4} key={donation._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Status */}
                  <Chip
                    label={donation.status}
                    size="small"
                    color={
                      donation.status === DonationStatus.COMPLETED
                        ? "success"
                        : donation.status === DonationStatus.DELIVERED
                        ? "info"
                        : "primary"
                    }
                    sx={{ mb: 2 }}
                  />

                  {/* Title */}
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {donation.title}
                  </Typography>

                  {/* Donor */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Avatar
                      src={getProfileImageUrl(donation.donorId) || undefined}
                      sx={{ width: 32, height: 32 }}
                    >
                      {getUserInitials(donation.donorId)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        From
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {donation.donorId.firstName} {donation.donorId.lastName}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Location */}
                  {donation.deliveryLocation && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Delivery to: {donation.deliveryLocation.city}
                      </Typography>
                    </Stack>
                  )}

                  {/* Date */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Requested{" "}
                      {formatDistanceToNow(new Date(donation.requestedAt!), {
                        addSuffix: true,
                      })}
                    </Typography>
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate(`/donations/${donation._id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyRequestsPage;

