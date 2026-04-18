import { useState } from "react";
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
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Close,
  Refresh,
  ExpandMore,
  ToggleOn,
  ToggleOff,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPermissionsByCategory,
  createPermission,
  updatePermission,
  deletePermission,
  type Permission,
} from "../../../shared/services/userService";
import { toast } from "react-toastify";

const PermissionManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    category: "",
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["permissions-by-category"],
    queryFn: getPermissionsByCategory,
    refetchOnMount: "always", // Always refetch when tab is visited
  });

  const createMutation = useMutation({
    mutationFn: createPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions-by-category"] });
      toast.success("Permission created successfully");
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create permission"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Permission> }) =>
      updatePermission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions-by-category"] });
      toast.success("Permission updated successfully");
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions-by-category"] });
      toast.success("Permission deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete permission"
      );
    },
  });

  const handleCreate = () => {
    setSelectedPermission(null);
    setFormData({
      name: "",
      key: "",
      description: "",
      category: "",
      isActive: true,
    });
    setOpenDialog(true);
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormData({
      name: permission.name,
      key: permission.key,
      description: permission.description,
      category: permission.category,
      isActive: permission.isActive,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPermission(null);
  };

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.key ||
      !formData.description ||
      !formData.category
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const submitData = {
      ...formData,
      key: formData.key.toLowerCase().replace(/\s+/g, "."),
      category: formData.category.toLowerCase(),
    };

    if (selectedPermission) {
      updateMutation.mutate({
        id: selectedPermission._id,
        data: submitData as any,
      });
    } else {
      createMutation.mutate(submitData as any);
    }
  };

  const handleDelete = (permission: Permission) => {
    if (
      window.confirm(
        `Delete permission "${permission.name}"? This action cannot be undone and will fail if the permission is in use.`
      )
    ) {
      deleteMutation.mutate(permission._id);
    }
  };

  const categories = [
    "permissions",
    "roles",
    "users",
    "donations",
    "requests",
    "businesses",
    "drivers",
    "packers",
    "payments",
    "system",
  ];

  const totalPermissions =
    data?.data?.reduce(
      (sum: number, cat: any) => sum + cat.permissions.length,
      0
    ) || 0;

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
            Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalPermissions} total permissions
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
            Create Permission
          </Button>
        </Stack>
      </Stack>

      {/* Permissions by Category */}
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
            Loading permissions...
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
          <Typography variant="body2" color="text.secondary">
            No permissions found
          </Typography>
        </Box>
      ) : (
        <Stack gap={2}>
          {data?.data?.map((category: any) => (
            <Accordion
              key={category.category}
              defaultExpanded={false}
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "12px !important",
                overflow: "hidden",
                "&:before": {
                  display: "none",
                },
                "&.Mui-expanded": {
                  margin: 0,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  bgcolor: "#f8fafc",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&.Mui-expanded": {
                    minHeight: 64,
                  },
                  "& .MuiAccordionSummary-content": {
                    my: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    textTransform="capitalize"
                    sx={{ fontSize: "1rem" }}
                  >
                    {category.category}
                  </Typography>
                  <Chip
                    label={`${category.permissions.length} permissions`}
                    size="small"
                    sx={{
                      bgcolor: alpha("#359364", 0.12),
                      color: "#359364",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      height: 24,
                      borderRadius: "6px",
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow
                        sx={{
                          bgcolor: "#fafbfc",
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            color: "#475569",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            py: 1.5,
                          }}
                        >
                          Name
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            color: "#475569",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Key
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            color: "#475569",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Description
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            color: "#475569",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.75rem",
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
                      {category.permissions.map((permission: Permission) => (
                        <TableRow
                          key={permission._id}
                          hover
                          sx={{
                            transition: "all 0.2s",
                            "&:hover": {
                              bgcolor: alpha("#359364", 0.03),
                            },
                            "&:last-child td": {
                              borderBottom: 0,
                            },
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Typography fontWeight={600} fontSize="0.875rem">
                              {permission.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={permission.key}
                              size="small"
                              sx={{
                                fontFamily: "monospace",
                                bgcolor: alpha("#6366f1", 0.1),
                                color: "#6366f1",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                height: 22,
                                borderRadius: "6px",
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {permission.description}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {permission.isActive ? (
                              <Chip
                                icon={<ToggleOn />}
                                label="Active"
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
                                icon={<ToggleOff />}
                                label="Inactive"
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  height: 24,
                                  borderRadius: "6px",
                                  bgcolor: alpha("#94a3b8", 0.1),
                                  color: "#64748b",
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Stack
                              direction="row"
                              gap={0.5}
                              justifyContent="flex-end"
                            >
                              <Tooltip title="Edit Permission" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(permission)}
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
                              <Tooltip title="Delete Permission" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(permission)}
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
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
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
              {selectedPermission ? "Edit Permission" : "Create New Permission"}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Permission Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                fullWidth
                required
                helperText="E.g., 'View Donations'"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Permission Key"
                value={formData.key}
                onChange={(e) =>
                  setFormData({ ...formData, key: e.target.value })
                }
                fullWidth
                required
                disabled={!!selectedPermission}
                helperText="E.g., 'donations.view' (lowercase, use dots)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                fullWidth
                required
                multiline
                rows={2}
                helperText="Brief description of what this permission allows"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                fullWidth
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isActive: e.target.value === "active",
                  })
                }
                fullWidth
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{
              background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
            }}
          >
            {selectedPermission ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PermissionManagement;
