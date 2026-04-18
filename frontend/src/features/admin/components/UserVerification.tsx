import { useState } from "react";
import ImageViewerModal from "../../../shared/components/shared/ImageViewerModal";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  alpha,
  Divider,
  DialogContentText,
  TextField,
} from "@mui/material";
import {
  Check,
  Close,
  Visibility,
  Refresh,
  VerifiedUser,
  Business,
  LocalShipping,
  AttachFile,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../../lib/axios";
import { approveUser, rejectUser } from "../../../shared/services/userService";

interface Document {
  _id?: string;
  type: string;
  path: string;
  filename: string;
  uploadedAt: Date | string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: {
    countryCode: string;
    number: string;
  };
  role: string | { _id: string; name: string; key: string; description: string };
  profileCompletionStatus: string;
  documents?: Document[];
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessInfo?: {
    businessName: string;
    businessType: string;
    registrationNumber?: string;
    description: string;
    website?: string;
    documents?: Document[];
  };
  driverInfo?: {
    licenseNumber: string;
    licenseExpiry: string;
    vehicleType: string;
    vehicleModel?: string;
    vehiclePlateNumber: string;
    vehicleCapacity?: number;
    documents?: Document[];
  };
  createdAt: string;
}

const UserVerification = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [selectedImageTitle, setSelectedImageTitle] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [userToReject, setUserToReject] = useState<User | null>(null);

  const queryClient = useQueryClient();

  // Fetch users pending verification
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pending-users"],
    queryFn: async () => {
      const response = await api.get("/users", {
        params: {
          profileCompletionStatus: "pending_review",
          limit: 100,
        },
      });
      return response.data;
    },
    refetchOnMount: 'always', // Always refetch when tab is visited
  });

  const approveMutation = useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User profile approved");
      refetch();
      setOpenDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to approve user");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User profile rejected");
      refetch();
      setRejectDialogOpen(false);
      setRejectionReason("");
      setUserToReject(null);
      setOpenDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reject user");
    },
  });

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleApprove = (user: User) => {
    approveMutation.mutate(user._id);
  };

  const handleReject = (user: User) => {
    setUserToReject(user);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (userToReject && rejectionReason.trim()) {
      rejectMutation.mutate({ id: userToReject._id, reason: rejectionReason });
    } else {
      toast.error("Please provide a reason for rejection");
    }
  };

  const handleApproveFromDialog = () => {
    if (selectedUser) {
      approveMutation.mutate(selectedUser._id);
    }
  };

  const handleRejectFromDialog = () => {
    if (selectedUser) {
      setUserToReject(selectedUser);
      setRejectDialogOpen(true);
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
            User Verification
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.data?.length || 0} users awaiting verification
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

      {/* Table */}
      {isLoading ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      ) : data?.data?.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <VerifiedUser sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            No Pending Verifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All user profiles have been verified
          </Typography>
        </Box>
      ) : (
        <TableContainer
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "#f8fafc",
                  borderBottom: "2px solid",
                  borderColor: "divider",
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "#475569",
                    textTransform: "uppercase",
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "#475569",
                    textTransform: "uppercase",
                  }}
                >
                  Email
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "#475569",
                    textTransform: "uppercase",
                  }}
                >
                  Role
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "#475569",
                    textTransform: "uppercase",
                  }}
                >
                  Phone
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "#475569",
                    textTransform: "uppercase",
                  }}
                >
                  Submitted
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "#475569",
                    textTransform: "uppercase",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data?.map((user: User) => (
                <TableRow
                  key={user._id}
                  hover
                  sx={{
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: alpha("#359364", 0.03),
                    },
                  }}
                >
                  <TableCell>
                    <Typography fontWeight={600}>
                      {user.firstName} {user.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={typeof user.role === 'string' ? user.role : user.role?.key || 'N/A'}
                      size="small"
                      icon={
                        (typeof user.role === 'string' ? user.role : user.role?.key) === "business" ? (
                          <Business fontSize="small" />
                        ) : (
                          <LocalShipping fontSize="small" />
                        )
                      }
                      sx={{
                        bgcolor:
                          (typeof user.role === 'string' ? user.role : user.role?.key) === "business"
                            ? alpha("#7c3aed", 0.12)
                            : alpha("#2563eb", 0.12),
                        color: (typeof user.role === 'string' ? user.role : user.role?.key) === "business" ? "#7c3aed" : "#2563eb",
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.phone?.countryCode} {user.phone?.number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" gap={0.5} justifyContent="flex-end">
                      <Tooltip title="View Details" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(user)}
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
                      <Tooltip title="Approve" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleApprove(user)}
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
                      <Tooltip title="Reject" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleReject(user)}
                          sx={{
                            color: "#ef4444",
                            bgcolor: alpha("#ef4444", 0.08),
                            "&:hover": {
                              bgcolor: alpha("#ef4444", 0.16),
                            },
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* User Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{ pb: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="h5" fontWeight={700}>
            User Verification Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review the information before approving or rejecting
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {selectedUser && (
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Name
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedUser.firstName} {selectedUser.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedUser.email}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedUser.phone?.countryCode}{" "}
                          {selectedUser.phone?.number}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Role
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ textTransform: "capitalize" }}
                        >
                          {typeof selectedUser.role === 'string' ? selectedUser.role : selectedUser.role?.name || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Address */}
              {selectedUser.address && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Address
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body1">
                        {selectedUser.address.street}
                        <br />
                        {selectedUser.address.city},{" "}
                        {selectedUser.address.state}{" "}
                        {selectedUser.address.zipCode}
                        <br />
                        {selectedUser.address.country}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Business Information */}
              {(typeof selectedUser.role === 'string' ? selectedUser.role : selectedUser.role?.key) === 'business' && selectedUser.businessInfo && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Business Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Business Name
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {selectedUser.businessInfo.businessName}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Business Type
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {selectedUser.businessInfo.businessType}
                          </Typography>
                        </Grid>
                        {selectedUser.businessInfo.registrationNumber && (
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Registration Number
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {selectedUser.businessInfo.registrationNumber}
                            </Typography>
                          </Grid>
                        )}
                        {selectedUser.businessInfo.website && (
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Website
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {selectedUser.businessInfo.website}
                            </Typography>
                          </Grid>
                        )}
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            Description
                          </Typography>
                          <Typography variant="body1">
                            {selectedUser.businessInfo.description}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Driver Information */}
              {(typeof selectedUser.role === 'string' ? selectedUser.role : selectedUser.role?.key) === 'driver' && selectedUser.driverInfo && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Driver Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            License Number
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {selectedUser.driverInfo.licenseNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            License Expiry
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {new Date(
                              selectedUser.driverInfo.licenseExpiry
                            ).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Vehicle Type
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {selectedUser.driverInfo.vehicleType}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Vehicle Plate Number
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {selectedUser.driverInfo.vehiclePlateNumber}
                          </Typography>
                        </Grid>
                        {selectedUser.driverInfo.vehicleModel && (
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Vehicle Model
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {selectedUser.driverInfo.vehicleModel}
                            </Typography>
                          </Grid>
                        )}
                        {selectedUser.driverInfo.vehicleCapacity && (
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Vehicle Capacity
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {selectedUser.driverInfo.vehicleCapacity} kg
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Documents */}
              {(() => {
                const roleKey = typeof selectedUser.role === 'string' ? selectedUser.role : selectedUser.role?.key;
                let allDocuments: Document[] = [];
                
                // Gather all documents based on role
                if (roleKey === 'business' && selectedUser.businessInfo?.documents) {
                  allDocuments = selectedUser.businessInfo.documents;
                } else if (roleKey === 'driver' && selectedUser.driverInfo?.documents) {
                  allDocuments = selectedUser.driverInfo.documents;
                } else if (selectedUser.documents) {
                  allDocuments = selectedUser.documents;
                }

                return allDocuments.length > 0 ? (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          Uploaded Documents
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                          {allDocuments.map((doc, index) => (
                            <Box
                              key={doc._id || index}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                                bgcolor: alpha("#f8fafc", 0.5),
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                <AttachFile color="action" />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" fontWeight={600}>
                                    {doc.type.replace(/_/g, ' ').toUpperCase()}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {doc.filename}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    • {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  const url = `/users/documents/file/${selectedUser._id}/${doc.filename}`;
                                  setSelectedImageUrl(url);
                                  setSelectedImageTitle(doc.type.replace(/_/g, ' ').toUpperCase());
                                  setImageViewerOpen(true);
                                }}
                              >
                                View
                              </Button>
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ) : null;
              })()}
            </Grid>
          )}
        </DialogContent>
        <DialogActions
          sx={{ p: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Close
          </Button>
          {selectedUser && (
            <>
              <Button
                onClick={handleRejectFromDialog}
                color="error"
                variant="outlined"
                disabled={rejectMutation.isPending}
              >
                Reject
              </Button>
              <Button
                onClick={handleApproveFromDialog}
                variant="contained"
                disabled={approveMutation.isPending}
                sx={{
                  background:
                    "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                }}
              >
                {approveMutation.isPending ? "Approving..." : "Approve"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        open={imageViewerOpen}
        onClose={() => {
          setImageViewerOpen(false);
          setSelectedImageUrl("");
          setSelectedImageTitle("");
        }}
        imageUrl={selectedImageUrl}
        title={selectedImageTitle}
      />

      {/* Reject User Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject User Profile</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide a reason for rejecting {userToReject?.firstName} {userToReject?.lastName}'s profile. This will be sent to the user.
          </DialogContentText>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter the reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRejectDialogOpen(false);
            setRejectionReason("");
            setUserToReject(null);
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleRejectConfirm}
            color="error"
            variant="contained"
            disabled={!rejectionReason.trim() || rejectMutation.isPending}
          >
            {rejectMutation.isPending ? "Rejecting..." : "Reject Profile"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserVerification;
