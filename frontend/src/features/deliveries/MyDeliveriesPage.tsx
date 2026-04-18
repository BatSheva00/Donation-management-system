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
  Divider,
} from "@mui/material";
import {
  LocalShipping,
  LocationOn,
  CalendarToday,
  Person,
  Inventory,
  Map as MapIcon,
  Visibility,
  TrendingFlat,
  CheckCircle,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../lib/axios";
import { Donation, DonationStatus } from "../donations/types/donation.types";
import { formatDistanceToNow } from "date-fns";
import { getUserInitials, getProfileImageUrl } from "../../utils/userUtils";
import { RouteMapDialog } from "./components/RouteMapDialog";

const MyDeliveriesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Donation | null>(null);

  // Fetch deliveries I'm assigned to (donations + requests)
  const { data: donationsData, isLoading: isLoadingDonations } = useQuery({
    queryKey: ["my-deliveries-donations"],
    queryFn: async () => {
      const response = await api.get("/donations?assignedToMe=true");
      return response.data.data;
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: requestsData, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["my-deliveries-requests"],
    queryFn: async () => {
      const response = await api.get("/requests/my/fulfilled");
      return response.data.data;
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const isLoading = isLoadingDonations || isLoadingRequests;
  const donations: Donation[] = donationsData || [];
  const requests: any[] = (requestsData || []).filter((r: any) => r.needsDelivery && r.assignedDriverId);
  
  // Combine both donations and requests for delivery
  const deliveries: any[] = [
    ...donations.map((d: Donation) => ({ ...d, type: 'donation' })),
    ...requests.map((r: any) => ({ ...r, type: 'request' }))
  ];

  // Filter by status
  const filteredDeliveries =
    statusFilter === "all"
      ? deliveries
      : deliveries.filter((d) => d.status === statusFilter);

  // Count by status
  const counts = {
    all: deliveries.length,
    waiting: deliveries.filter((d) => d.status === DonationStatus.WAITING_FOR_DELIVERY).length,
    approved: deliveries.filter((d) => d.status === DonationStatus.APPROVED).length,
    in_transit: deliveries.filter((d) => d.status === DonationStatus.IN_TRANSIT).length,
    delivered: deliveries.filter((d) => d.status === DonationStatus.DELIVERED).length,
    completed: deliveries.filter((d) => d.status === DonationStatus.COMPLETED).length,
  };

  // Mutation for marking in transit
  const markInTransitMutation = useMutation({
    mutationFn: async (donationId: string) => {
      const response = await api.patch(`/donations/${donationId}/mark-in-transit`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-deliveries"] });
      toast.success("Status updated to In Transit");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  // Mutation for marking delivered
  const markDeliveredMutation = useMutation({
    mutationFn: async (donationId: string) => {
      const response = await api.patch(`/donations/${donationId}/mark-delivered`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-deliveries"] });
      toast.success("Delivery marked as complete");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <LocalShipping sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h4" fontWeight={700}>
            {t("myDeliveries.title") || "My Deliveries"}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {t("myDeliveries.subtitle") || "Track and manage your assigned deliveries"}
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
          <Tab label={`Waiting for Delivery (${counts.waiting})`} value={DonationStatus.WAITING_FOR_DELIVERY} />
          <Tab label={`Ready (${counts.approved})`} value={DonationStatus.APPROVED} />
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
      {!isLoading && filteredDeliveries.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          <LocalShipping sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("myDeliveries.noDeliveries") || "No deliveries found"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusFilter === "all"
              ? t("myDeliveries.assignFirst") ||
                "Go to Deliveries page to assign yourself to available deliveries"
              : t("myDeliveries.noInStatus") || "No deliveries in this status"}
          </Typography>
        </Box>
      )}

      {/* Deliveries Grid */}
      {!isLoading && filteredDeliveries.length > 0 && (
        <Grid container spacing={3}>
          {filteredDeliveries.map((donation) => (
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
                  {/* Status & Quick Actions */}
                  <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={donation.status}
                      size="small"
                      color={
                        donation.status === DonationStatus.COMPLETED
                          ? "success"
                          : donation.status === DonationStatus.IN_TRANSIT
                          ? "warning"
                          : donation.status === DonationStatus.APPROVED
                          ? "info"
                          : "default"
                      }
                    />
                    
                    {/* Quick Action Buttons */}
                    {donation.status === DonationStatus.WAITING_FOR_DELIVERY && (
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        startIcon={markInTransitMutation.isPending ? <CircularProgress size={14} /> : <TrendingFlat />}
                        onClick={() => markInTransitMutation.mutate(donation._id)}
                        disabled={markInTransitMutation.isPending}
                        sx={{ minWidth: 120 }}
                      >
                        In Transit
                      </Button>
                    )}
                    {donation.status === DonationStatus.IN_TRANSIT && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={markDeliveredMutation.isPending ? <CircularProgress size={14} /> : <CheckCircle />}
                        onClick={() => markDeliveredMutation.mutate(donation._id)}
                        disabled={markDeliveredMutation.isPending}
                        sx={{ minWidth: 120 }}
                      >
                        Delivered
                      </Button>
                    )}
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {donation.title}
                  </Typography>

                  {/* Type & Quantity */}
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      icon={<Inventory />}
                      label={`${donation.quantity} ${donation.unit}`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  {/* Pickup Location */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
                    >
                      <LocationOn fontSize="small" />
                      Pickup
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {donation.pickupLocation.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {donation.pickupLocation.city}
                    </Typography>
                  </Box>

                  {/* Delivery Location */}
                  {donation.deliveryLocation && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
                      >
                        <LocalShipping fontSize="small" />
                        Delivery
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {donation.deliveryLocation.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {donation.deliveryLocation.city}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Requester */}
                  {donation.requestedBy && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        src={getProfileImageUrl(donation.requestedBy) || undefined}
                        sx={{ width: 32, height: 32 }}
                      >
                        {getUserInitials(donation.requestedBy)}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Delivering to
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {donation.requestedBy.firstName} {donation.requestedBy.lastName}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1.5 }}>
                  {donation.deliveryLocation && (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      startIcon={<MapIcon />}
                      onClick={() => {
                        setSelectedDelivery(donation);
                        setShowRouteDialog(true);
                      }}
                    >
                      View Route
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Visibility />}
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

      {/* Route Map Dialog */}
      {selectedDelivery && selectedDelivery.deliveryLocation && (
        <RouteMapDialog
          open={showRouteDialog}
          onClose={() => {
            setShowRouteDialog(false);
            setSelectedDelivery(null);
          }}
          pickupLocation={selectedDelivery.pickupLocation}
          deliveryLocation={selectedDelivery.deliveryLocation}
          donationTitle={selectedDelivery.title}
        />
      )}
    </Container>
  );
};

export default MyDeliveriesPage;

