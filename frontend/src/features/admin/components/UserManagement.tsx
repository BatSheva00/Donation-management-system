import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ImageViewerModal from "../../../shared/components/shared/ImageViewerModal";
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
  Avatar,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  DialogContentText,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Check,
  Block,
  Search,
  VpnKey,
  Refresh,
  Visibility,
  AttachFile,
  Close,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  deleteUser,
  approveUser,
  rejectUser,
  suspendUser,
  type User,
} from "../../../shared/services/userService";
import { toast } from "react-toastify";
import UserDialog from "./UserDialog";
import UserPermissionEditor from "./UserPermissionEditor";
import { usePermission } from "../../../shared/hooks/usePermission";
import { getProfileImageUrl, getUserInitials } from "../../../utils/userUtils";

const UserManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPermissions, setOpenPermissions] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [selectedImageTitle, setSelectedImageTitle] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [userToReject, setUserToReject] = useState<User | null>(null);
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "users",
      { search, role: roleFilter, status: statusFilter, page },
    ],
    queryFn: () =>
      getAllUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      }),
    refetchOnMount: "always", // Always refetch when tab is visited
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User approved successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to approve user");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User profile rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
      setUserToReject(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reject user");
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      suspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User suspended successfully");
      setSuspendDialogOpen(false);
      setSuspendReason("");
      setUserToSuspend(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to suspend user");
    },
  });

  // Permission checks for actions
  const canCreateUser = usePermission(["users.create"]);
  const canEditUser = usePermission(["users.edit"]);
  const canDeleteUser = usePermission(["users.delete"]);
  const canApproveUser = usePermission(["users.approve"]);
  const canSuspendUser = usePermission(["users.suspend"]);
  const canManagePermissions = usePermission([
    "permissions.grant",
    "permissions.deny",
  ]);


  const handleDelete = (user: User) => {
    if (
      window.confirm(`Delete user ${user.email}? This action cannot be undone.`)
    ) {
      deleteMutation.mutate(user._id);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const handleManagePermissions = (user: User) => {
    setSelectedUser(user);
    setOpenPermissions(true);
  };

  const handleApprove = (user: User) => {
    approveMutation.mutate(user._id);
  };

  const handleReject = (user: User) => {
    setUserToReject(user);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (userToReject && rejectReason.trim()) {
      rejectMutation.mutate({ id: userToReject._id, reason: rejectReason });
    } else {
      toast.error("Please provide a reason for rejection");
    }
  };

  const handleSuspend = (user: User) => {
    setUserToSuspend(user);
    setSuspendDialogOpen(true);
  };

  const handleSuspendConfirm = () => {
    if (userToSuspend) {
      suspendMutation.mutate({
        id: userToSuspend._id,
        reason: suspendReason.trim() || undefined,
      });
    }
  };

  const handleView = (user: User) => {
    // Navigate to user profile page
    navigate(`/profile/${user._id}`);
  };

  const getRoleColor = (roleKey: string) => {
    const colors: Record<string, string> = {
      admin: "#dc2626",
      business: "#7c3aed",
      driver: "#2563eb",
      packer: "#059669",
      user: "#0891b2",
    };
    return colors[roleKey] || "#6b7280";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, "success" | "warning" | "error" | "default"> =
      {
        active: "success",
        suspended: "error",
        pending_verification: "warning",
      };
    return colors[status] || "default";
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
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.pagination?.total || 0} total users
          </Typography>
        </Box>
        <Stack direction="row" gap={2}>
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
          {canCreateUser && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
              sx={{
                background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                boxShadow: "0 4px 12px rgba(53, 147, 100, 0.25)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(53, 147, 100, 0.35)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s",
              }}
            >
              Create User
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Filters */}
      <Box
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
          <TextField
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flexGrow: 1,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#fafbfc",
                "&:hover": {
                  bgcolor: "background.paper",
                },
                "&.Mui-focused": {
                  bgcolor: "background.paper",
                },
              },
            }}
            size="small"
          />
          <TextField
            select
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{
              minWidth: 150,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#fafbfc",
              },
            }}
            size="small"
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="business">Business</MenuItem>
            <MenuItem value="driver">Driver</MenuItem>
            <MenuItem value="packer">Packer</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: 150,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#fafbfc",
              },
            }}
            size="small"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
            <MenuItem value="pending_verification">Pending</MenuItem>
          </TextField>
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          mb: 3,
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
                  letterSpacing: "0.5px",
                  py: 2,
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
                  letterSpacing: "0.5px",
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
                  letterSpacing: "0.5px",
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
                  letterSpacing: "0.5px",
                }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Verified
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Created
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ py: 8, color: "text.secondary" }}
                >
                  <Typography variant="body2">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ py: 8, color: "text.secondary" }}
                >
                  <Typography variant="body2">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((user: User) => (
                <TableRow
                  key={user._id}
                  hover
                  sx={{
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: alpha("#359364", 0.03),
                      transform: "scale(1.001)",
                    },
                    "&:last-child td": {
                      borderBottom: 0,
                    },
                  }}
                >
                  <TableCell sx={{ py: 2.5 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        src={getProfileImageUrl(user) || undefined}
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "primary.main",
                          fontSize: "0.875rem",
                        }}
                      >
                        {getUserInitials(user)}
                      </Avatar>
                      <Typography fontWeight={600} sx={{ fontSize: "0.95rem" }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Chip
                      label={
                        typeof user.role === "string"
                          ? user.role
                          : user.role.key
                      }
                      size="small"
                      sx={{
                        bgcolor: alpha(
                          getRoleColor(
                            typeof user.role === "string"
                              ? user.role
                              : user.role.key
                          ),
                          0.12
                        ),
                        color: getRoleColor(
                          typeof user.role === "string"
                            ? user.role
                            : user.role.key
                        ),
                        fontWeight: 600,
                        textTransform: "capitalize",
                        fontSize: "0.75rem",
                        height: 24,
                        borderRadius: "6px",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Chip
                      label={user.status.replace("_", " ")}
                      size="small"
                      color={getStatusColor(user.status)}
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 24,
                        borderRadius: "6px",
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    {user.isEmailVerified ? (
                      <Chip
                        label="Yes"
                        size="small"
                        color="success"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: 24,
                          borderRadius: "6px",
                        }}
                      />
                    ) : (
                      <Chip
                        label="No"
                        size="small"
                        color="warning"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: 24,
                          borderRadius: "6px",
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2.5 }}>
                    <Stack direction="row" gap={0.5} justifyContent="flex-end">
                      <Tooltip title="View Details" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleView(user)}
                          sx={{
                            color: "#8b5cf6",
                            bgcolor: alpha("#8b5cf6", 0.08),
                            "&:hover": {
                              bgcolor: alpha("#8b5cf6", 0.16),
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s",
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {canEditUser && (
                        <Tooltip title="Edit User" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(user)}
                            sx={{
                              color: "#3b82f6",
                              bgcolor: alpha("#3b82f6", 0.08),
                              "&:hover": {
                                bgcolor: alpha("#3b82f6", 0.16),
                                transform: "scale(1.1)",
                              },
                              transition: "all 0.2s",
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {canManagePermissions && (
                        <Tooltip title="Manage Permissions" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleManagePermissions(user)}
                            sx={{
                              color: "#f97316",
                              bgcolor: alpha("#f97316", 0.08),
                              "&:hover": {
                                bgcolor: alpha("#f97316", 0.16),
                                transform: "scale(1.1)",
                              },
                              transition: "all 0.2s",
                            }}
                          >
                            <VpnKey fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {canApproveUser && user.status !== "active" && (
                        <>
                          <Tooltip title="Approve User" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(user)}
                              sx={{
                                color: "#10b981",
                                bgcolor: alpha("#10b981", 0.08),
                                "&:hover": {
                                  bgcolor: alpha("#10b981", 0.16),
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s",
                              }}
                            >
                              <Check fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject User" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleReject(user)}
                              sx={{
                                color: "#ef4444",
                                bgcolor: alpha("#ef4444", 0.08),
                                "&:hover": {
                                  bgcolor: alpha("#ef4444", 0.16),
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s",
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                      {canSuspendUser && user.status === "active" && (
                        <Tooltip title="Suspend User" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleSuspend(user)}
                            sx={{
                              color: "#f59e0b",
                              bgcolor: alpha("#f59e0b", 0.08),
                              "&:hover": {
                                bgcolor: alpha("#f59e0b", 0.16),
                                transform: "scale(1.1)",
                              },
                              transition: "all 0.2s",
                            }}
                          >
                            <Block fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {canDeleteUser && (
                        <Tooltip title="Delete User" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(user)}
                            sx={{
                              color: "#ef4444",
                              bgcolor: alpha("#ef4444", 0.08),
                              "&:hover": {
                                bgcolor: alpha("#ef4444", 0.16),
                                transform: "scale(1.1)",
                              },
                              transition: "all 0.2s",
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Page {page} of {data.pagination.pages}
          </Typography>
          <Pagination
            count={data.pagination.pages}
            page={page}
            onChange={(_e, value) => setPage(value)}
            color="primary"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 600,
                "&.Mui-selected": {
                  background:
                    "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                },
              },
            }}
          />
        </Box>
      )}

      {/* Dialogs */}
      <UserDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {selectedUser && (
        <UserPermissionEditor
          open={openPermissions}
          onClose={() => {
            setOpenPermissions(false);
            setSelectedUser(null);
          }}
          userId={selectedUser._id}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
        />
      )}

      {/* View Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => {
          setOpenViewDialog(false);
          setSelectedUser(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              User Details
            </Typography>
            <IconButton
              onClick={() => {
                setOpenViewDialog(false);
                setSelectedUser(null);
              }}
              size="small"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Grid container spacing={3}>
              {/* User Info */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Basic Information
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
                          Role
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ textTransform: "capitalize" }}
                        >
                          {typeof selectedUser.role === "string"
                            ? selectedUser.role
                            : selectedUser.role?.name || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Status
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ textTransform: "capitalize" }}
                        >
                          {selectedUser.status.replace("_", " ")}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Documents */}
              {(() => {
                const roleKey =
                  typeof selectedUser.role === "string"
                    ? selectedUser.role
                    : selectedUser.role?.key;
                let allDocuments: any[] = [];

                // Gather all documents based on role
                if (
                  roleKey === "business" &&
                  (selectedUser as any).businessInfo?.documents
                ) {
                  allDocuments = (selectedUser as any).businessInfo.documents;
                } else if (
                  roleKey === "driver" &&
                  (selectedUser as any).driverInfo?.documents
                ) {
                  allDocuments = (selectedUser as any).driverInfo.documents;
                } else if ((selectedUser as any).documents) {
                  allDocuments = (selectedUser as any).documents;
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
                          {allDocuments.map((doc: any, index: number) => (
                            <Box
                              key={doc._id || index}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: 2,
                                bgcolor: alpha("#f8fafc", 0.5),
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  flex: 1,
                                }}
                              >
                                <AttachFile color="action" />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" fontWeight={600}>
                                    {doc.type.replace(/_/g, " ").toUpperCase()}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {doc.filename}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                  >
                                    •{" "}
                                    {new Date(
                                      doc.uploadedAt
                                    ).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  const url = `/users/documents/file/${selectedUser._id}/${doc.filename}`;
                                  setSelectedImageUrl(url);
                                  setSelectedImageTitle(
                                    doc.type.replace(/_/g, " ").toUpperCase()
                                  );
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
                ) : (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                        >
                          No documents uploaded
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })()}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setOpenViewDialog(false);
              setSelectedUser(null);
            }}
          >
            Close
          </Button>
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
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter the reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRejectDialogOpen(false);
            setRejectReason("");
            setUserToReject(null);
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleRejectConfirm}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim() || rejectMutation.isPending}
          >
            {rejectMutation.isPending ? "Rejecting..." : "Reject Profile"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={suspendDialogOpen} onClose={() => setSuspendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Suspend User</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to suspend {userToSuspend?.firstName} {userToSuspend?.lastName}? You can optionally provide a reason.
          </DialogContentText>
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            label="Suspension Reason (Optional)"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="Enter the reason for suspension (optional)..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSuspendDialogOpen(false);
            setSuspendReason("");
            setUserToSuspend(null);
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleSuspendConfirm}
            color="warning"
            variant="contained"
            disabled={suspendMutation.isPending}
          >
            {suspendMutation.isPending ? "Suspending..." : "Suspend User"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
