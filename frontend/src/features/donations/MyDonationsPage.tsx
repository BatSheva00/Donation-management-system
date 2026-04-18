import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import { Favorite } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "../../lib/axios";
import { DonationCard } from "./components/DonationCard";
import { Donation, DonationStatus } from "./types/donation.types";

const MyDonationsPage = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch my donations (no cache - always fresh data)
  const { data, isLoading } = useQuery({
    queryKey: ["my-donations"],
    queryFn: async () => {
      const response = await api.get("/donations/my-donations");
      return response.data.data;
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const donations: Donation[] = data || [];

  // Filter donations by status
  const filteredDonations =
    statusFilter === "all"
      ? donations
      : donations.filter((d) => d.status === statusFilter);

  // Count by status
  const counts = {
    all: donations.length,
    pending: donations.filter((d) => d.status === DonationStatus.PENDING).length,
    requested: donations.filter((d) => d.status === DonationStatus.REQUESTED).length,
    approved: donations.filter((d) => d.status === DonationStatus.APPROVED).length,
    in_transit: donations.filter((d) => d.status === DonationStatus.IN_TRANSIT).length,
    delivered: donations.filter((d) => d.status === DonationStatus.DELIVERED).length,
    completed: donations.filter((d) => d.status === DonationStatus.COMPLETED).length,
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Favorite sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h4" fontWeight={700}>
            {t("myDonations.title") || "My Donations"}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {t("myDonations.subtitle") || "Track and manage all your donations"}
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
          <Tab label={`Pending (${counts.pending})`} value={DonationStatus.PENDING} />
          <Tab label={`Requested (${counts.requested})`} value={DonationStatus.REQUESTED} />
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
      {!isLoading && filteredDonations.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          <Favorite sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("myDonations.noDonations") || "No donations found"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusFilter === "all"
              ? t("myDonations.createFirst") || "Create your first donation to get started"
              : t("myDonations.noInStatus") || "No donations in this status"}
          </Typography>
        </Box>
      )}

      {/* Donations Grid */}
      {!isLoading && filteredDonations.length > 0 && (
        <Grid container spacing={3}>
          {filteredDonations.map((donation) => (
            <Grid item xs={12} sm={6} md={4} key={donation._id}>
              <DonationCard donation={donation} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyDonationsPage;

