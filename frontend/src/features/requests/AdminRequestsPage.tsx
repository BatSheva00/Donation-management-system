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
  Button,
  Paper,
  Chip,
  Stack,
  alpha,
} from "@mui/material";
import { AdminPanelSettings, Visibility, Check, Close } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminRequests, useApproveRequest, useRejectRequest } from "./hooks/useRequests";
import { RequestStatus } from "./types/request.types";
import UserAvatar from "../../shared/components/shared/UserAvatar";

const AdminRequestsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading, error } = useAdminRequests({
    status: statusFilter === "all" ? undefined : (statusFilter as RequestStatus),
  });

  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const requests = data?.data || [];

  // Count by status
  const counts = {
    all: requests.length,
    pending: requests.filter((r: any) => r.status === RequestStatus.PENDING).length,
    approved: requests.filter((r: any) => r.status === RequestStatus.APPROVED).length,
    fulfilled: requests.filter((r: any) => r.status === RequestStatus.FULFILLED).length,
    completed: requests.filter((r: any) => r.status === RequestStatus.COMPLETED).length,
    rejected: requests.filter((r: any) => r.status === RequestStatus.REJECTED).length,
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to approve request:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <AdminPanelSettings sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h4" fontWeight={700}>
            {t("admin.requests.title") || "Manage Requests"}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {t("admin.requests.subtitle") ||
            "Review, approve, or reject donation requests"}
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
          <Tab
            label={`${t("status.pending")} (${counts.pending})`}
            value={RequestStatus.PENDING}
          />
          <Tab
            label={`${t("status.approved")} (${counts.approved})`}
            value={RequestStatus.APPROVED}
          />
          <Tab
            label={`${t("status.fulfilled")} (${counts.fulfilled})`}
            value={RequestStatus.FULFILLED}
          />
          <Tab
            label={`${t("status.completed")} (${counts.completed})`}
            value={RequestStatus.COMPLETED}
          />
          <Tab
            label={`${t("status.rejected")} (${counts.rejected})`}
            value={RequestStatus.REJECTED}
          />
        </Tabs>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t("common.error") || "Failed to load requests"}
        </Alert>
      )}

      {/* Requests List */}
      {!isLoading && requests.length === 0 && (
        <Alert severity="info">
          {t("admin.requests.noRequests") || "No requests found"}
        </Alert>
      )}

      {!isLoading && requests.length > 0 && (
        <Grid container spacing={2}>
          {requests.map((request: any) => (
            <Grid item xs={12} key={request._id}>
              <Paper sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip
                        label={request.status.replace(/_/g, " ")}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(request.status), 0.1),
                          color: getStatusColor(request.status),
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                      <Chip
                        label={request.category}
                        size="small"
                        sx={{
                          bgcolor: alpha("#3b82f6", 0.1),
                          color: "#3b82f6",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                      <Chip
                        label={request.urgency}
                        size="small"
                        sx={{
                          bgcolor: alpha(
                            request.urgency === "high"
                              ? "#ef4444"
                              : request.urgency === "medium"
                              ? "#f59e0b"
                              : "#10b981",
                            0.1
                          ),
                          color:
                            request.urgency === "high"
                              ? "#ef4444"
                              : request.urgency === "medium"
                              ? "#f59e0b"
                              : "#10b981",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                    </Stack>

                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {request.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {request.description}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <UserAvatar
                          user={request.requesterId}
                          sx={{ width: 32, height: 32 }}
                        />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {t("requests.requestedBy") || "Requested by"}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {request.requesterId.firstName} {request.requesterId.lastName}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack direction="column" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/requests/${request._id}`)}
                    >
                      {t("common.view") || "View"}
                    </Button>

                    {request.status === RequestStatus.PENDING && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<Check />}
                          onClick={() => handleApprove(request._id)}
                          disabled={approveMutation.isPending}
                        >
                          {t("admin.approve") || "Approve"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Close />}
                          onClick={() => handleReject(request._id)}
                          disabled={rejectMutation.isPending}
                        >
                          {t("admin.reject") || "Reject"}
                        </Button>
                      </>
                    )}
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminRequestsPage;

