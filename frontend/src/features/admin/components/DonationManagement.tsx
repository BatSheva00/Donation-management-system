import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  Stack,
  Typography,
  Pagination,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Delete,
  Check,
  Close as CloseIcon,
  Search,
  Refresh,
  Visibility,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../../lib/axios";
import { Donation, DonationStatus } from "../../donations/types/donation.types";
import { formatDistanceToNow } from "date-fns";
import { getProfileImageUrl, getUserInitials } from "../../../utils/userUtils";

const DonationManagement = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("requested"); // Default to requested
  const [page, setPage] = useState(1);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);

  const queryClient = useQueryClient();

  // Fetch donations
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-donations", { search, status: statusFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", "10");

      const response = await api.get(`/donations?${params.toString()}`);
      return response.data;
    },
    refetchOnMount: "always",
  });

  // Delete donation mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/donations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-donations"] });
      toast.success("Donation deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete donation");
    },
  });

  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/donations/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-donations"] });
      setOpenViewDialog(false);
      toast.success("Request approved successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to approve request");
    },
  });

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      await api.patch(`/donations/${id}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-donations"] });
      setOpenViewDialog(false);
      toast.success("Request rejected successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reject request");
    },
  });

  const handleDelete = (donation: Donation) => {
    if (window.confirm(`Delete donation "${donation.title}"?`)) {
      deleteMutation.mutate(donation._id);
    }
  };

  const handleView = (donation: Donation) => {
    setSelectedDonation(donation);
    setOpenViewDialog(true);
  };

  const handleApprove = (donation: Donation) => {
    if (window.confirm(`Approve request for "${donation.title}"?`)) {
      approveMutation.mutate(donation._id);
    }
  };

  const handleReject = (donation: Donation) => {
    const reason = window.prompt("Rejection reason (optional):");
    if (reason !== null) {
      rejectMutation.mutate({ id: donation._id, reason });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case DonationStatus.PENDING:
        return "#f59e0b";
      case DonationStatus.REQUESTED:
        return "#3b82f6";
      case DonationStatus.APPROVED:
        return "#8b5cf6";
      case DonationStatus.IN_TRANSIT:
        return "#06b6d4";
      case DonationStatus.DELIVERED:
      case DonationStatus.COMPLETED:
        return "#10b981";
      case DonationStatus.CANCELLED:
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            Donation Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.total || 0} donations total
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => refetch()}
          disabled={isLoading}
          sx={{
            borderColor: "divider",
            color: "text.primary",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: alpha("#359364", 0.04),
            },
          }}
        >
          Refresh
        </Button>
      </Stack>

      {/* Filters */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search donations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value={DonationStatus.PENDING}>Pending</MenuItem>
          <MenuItem value={DonationStatus.REQUESTED}>Requested</MenuItem>
          <MenuItem value={DonationStatus.APPROVED}>Approved</MenuItem>
          <MenuItem value={DonationStatus.IN_TRANSIT}>In Transit</MenuItem>
          <MenuItem value={DonationStatus.DELIVERED}>Delivered</MenuItem>
          <MenuItem value={DonationStatus.COMPLETED}>Completed</MenuItem>
          <MenuItem value={DonationStatus.CANCELLED}>Cancelled</MenuItem>
        </TextField>
      </Stack>

      {/* Table */}
      <TableContainer
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha("#359364", 0.05) }}>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Donor</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 8, color: "text.secondary" }}
                >
                  <Typography variant="body2">No donations found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((donation: Donation) => (
                <TableRow
                  key={donation._id}
                  hover
                  sx={{
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: alpha("#359364", 0.03),
                    },
                  }}
                >
                  <TableCell>
                    <Typography fontWeight={600} sx={{ fontSize: "0.95rem" }}>
                      {donation.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {donation.pickupLocation.city}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: "0.875rem" }}>
                        {donation.donorId?.firstName?.[0] || "?"}
                      </Avatar>
                      <Typography variant="body2">
                        {donation.donorId?.firstName} {donation.donorId?.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={donation.status}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(donation.status), 0.1),
                        color: getStatusColor(donation.status),
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {donation.type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDistanceToNow(new Date(donation.createdAt), {
                        addSuffix: true,
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {/* View */}
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleView(donation)}
                          sx={{
                            color: "#3b82f6",
                            bgcolor: alpha("#3b82f6", 0.08),
                            "&:hover": {
                              bgcolor: alpha("#3b82f6", 0.16),
                            },
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Approve (only for requested status) */}
                      {donation.status === DonationStatus.REQUESTED && (
                        <Tooltip title="Approve Request">
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(donation)}
                            sx={{
                              color: "#10b981",
                              bgcolor: alpha("#10b981", 0.08),
                              "&:hover": {
                                bgcolor: alpha("#10b981", 0.16),
                              },
                            }}
                          >
                            <Check fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Reject (only for requested status) */}
                      {donation.status === DonationStatus.REQUESTED && (
                        <Tooltip title="Reject Request">
                          <IconButton
                            size="small"
                            onClick={() => handleReject(donation)}
                            sx={{
                              color: "#ef4444",
                              bgcolor: alpha("#ef4444", 0.08),
                              "&:hover": {
                                bgcolor: alpha("#ef4444", 0.16),
                              },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Delete */}
                      <Tooltip title="Delete Donation">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(donation)}
                          sx={{
                            color: "#ef4444",
                            bgcolor: alpha("#ef4444", 0.08),
                            "&:hover": {
                              bgcolor: alpha("#ef4444", 0.16),
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={data.pages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedDonation && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700}>
                  {selectedDonation.title}
                </Typography>
                <IconButton onClick={() => setOpenViewDialog(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Basic Info */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDonation.description}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedDonation.status}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: alpha(getStatusColor(selectedDonation.status), 0.1),
                      color: getStatusColor(selectedDonation.status),
                      fontWeight: 600,
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedDonation.type}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quantity
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedDonation.quantity} {selectedDonation.unit}
                  </Typography>
                </Grid>

                {/* Donor Info */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Donor Information
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={getProfileImageUrl(selectedDonation.donorId) || undefined}
                      sx={{ width: 48, height: 48 }}
                    >
                      {getUserInitials(selectedDonation.donorId)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        fontWeight={600}
                        sx={{
                          cursor: "pointer",
                          color: "primary.main",
                          "&:hover": { textDecoration: "underline" },
                        }}
                        onClick={() =>
                          navigate(`/profile/${selectedDonation.donorId?._id}`)
                        }
                      >
                        {selectedDonation.donorId?.firstName}{" "}
                        {selectedDonation.donorId?.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedDonation.donorId?.email}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        navigate(`/profile/${selectedDonation.donorId?._id}`)
                      }
                    >
                      View Profile
                    </Button>
                  </Box>
                </Grid>

                {/* Requester Info */}
                {selectedDonation.requestedBy && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Requester Information
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={getProfileImageUrl(selectedDonation.requestedBy) || undefined}
                        sx={{ width: 48, height: 48, bgcolor: "#3b82f6" }}
                      >
                        {getUserInitials(selectedDonation.requestedBy)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          fontWeight={600}
                          sx={{
                            cursor: "pointer",
                            color: "primary.main",
                            "&:hover": { textDecoration: "underline" },
                          }}
                          onClick={() =>
                            navigate(`/profile/${selectedDonation.requestedBy?._id}`)
                          }
                        >
                          {selectedDonation.requestedBy?.firstName}{" "}
                          {selectedDonation.requestedBy?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedDonation.requestedBy?.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Requested{" "}
                          {formatDistanceToNow(new Date(selectedDonation.requestedAt!), {
                            addSuffix: true,
                          })}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          navigate(`/profile/${selectedDonation.requestedBy?._id}`)
                        }
                      >
                        View Profile
                      </Button>
                    </Box>
                  </Grid>
                )}

                {/* Pickup Location */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Pickup Location
                  </Typography>
                  <Typography variant="body2">
                    {selectedDonation.pickupLocation.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDonation.pickupLocation.city}
                  </Typography>
                </Grid>

                {/* Delivery Location - if exists */}
                {selectedDonation.deliveryLocation && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Delivery Location (Delivery Required)
                    </Typography>
                    <Typography variant="body2">
                      {selectedDonation.deliveryLocation.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDonation.deliveryLocation.city}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
              {selectedDonation.status === DonationStatus.REQUESTED && (
                <>
                  <Button
                    onClick={() => handleReject(selectedDonation)}
                    color="error"
                    variant="outlined"
                  >
                    Reject Request
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedDonation)}
                    variant="contained"
                    color="success"
                  >
                    Approve Request
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default DonationManagement;

