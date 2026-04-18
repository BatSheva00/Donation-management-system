import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from "@mui/material";
import { RequestQuote } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useMyRequests } from "./hooks/useRequests";
import { RequestStatus } from "./types/request.types";
import { RequestCard } from "./components/RequestCard";

const MyRequestsPage = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch my requests
  const { data, isLoading } = useMyRequests();

  const requests = data?.data || [];

  // Filter requests by status
  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((r: any) => r.status === statusFilter);

  // Count by status
  const counts = {
    all: requests.length,
    pending: requests.filter((r: any) => r.status === RequestStatus.PENDING).length,
    approved: requests.filter((r: any) => r.status === RequestStatus.APPROVED).length,
    fulfilled: requests.filter((r: any) => r.status === RequestStatus.FULFILLED).length,
    waiting_for_delivery: requests.filter((r: any) => r.status === RequestStatus.WAITING_FOR_DELIVERY).length,
    in_transit: requests.filter((r: any) => r.status === RequestStatus.IN_TRANSIT).length,
    delivered: requests.filter((r: any) => r.status === RequestStatus.DELIVERED).length,
    completed: requests.filter((r: any) => r.status === RequestStatus.COMPLETED).length,
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <RequestQuote sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h4" fontWeight={700}>
            {t("myRequests.title") || "My Requests"}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {t("myRequests.subtitle") || "Track and manage all your donation requests"}
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
          <Tab label={`${t("common.all")} (${counts.all})`} value="all" />
          <Tab label={`${t("status.pending")} (${counts.pending})`} value={RequestStatus.PENDING} />
          <Tab label={`${t("status.approved")} (${counts.approved})`} value={RequestStatus.APPROVED} />
          <Tab label={`${t("status.fulfilled")} (${counts.fulfilled})`} value={RequestStatus.FULFILLED} />
          <Tab label={`${t("status.waiting_for_delivery")} (${counts.waiting_for_delivery})`} value={RequestStatus.WAITING_FOR_DELIVERY} />
          <Tab label={`${t("status.in_transit")} (${counts.in_transit})`} value={RequestStatus.IN_TRANSIT} />
          <Tab label={`${t("status.delivered")} (${counts.delivered})`} value={RequestStatus.DELIVERED} />
          <Tab label={`${t("status.completed")} (${counts.completed})`} value={RequestStatus.COMPLETED} />
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
          <RequestQuote sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("myRequests.noRequests") || "No requests found"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusFilter === "all"
              ? t("myRequests.noRequestsDescription") || "You haven't created any requests yet"
              : t("myRequests.noRequestsInStatus") || `No requests with this status`}
          </Typography>
        </Box>
      )}

      {/* Requests Grid */}
      {!isLoading && filteredRequests.length > 0 && (
        <Grid container spacing={3}>
          {filteredRequests.map((request: any) => (
            <Grid item xs={12} sm={6} md={4} key={request._id}>
              <RequestCard request={request} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyRequestsPage;


