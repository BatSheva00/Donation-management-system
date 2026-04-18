import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  styled,
} from "@mui/material";
import {
  Close,
  ExpandMore,
  Check,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserPermissions,
  getPermissionsByCategory,
  bulkUpdateUserPermissions,
  type Permission,
} from "../../../shared/services/userService";
import { toast } from "react-toastify";

interface UserPermissionEditorProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

type PermissionState = "default" | "granted" | "denied";

interface PermissionConfig {
  permissionId: string;
  state: PermissionState;
  fromRole: boolean;
}

// Styled checkbox-like radio button
const CheckboxRadio = styled(Radio)(({ theme }) => ({
  padding: 4,
  "& .MuiSvgIcon-root": {
    fontSize: 20,
  },
  "&.Mui-checked": {
    "& .MuiSvgIcon-root": {
      borderRadius: 3,
    },
  },
}));

const UserPermissionEditor: React.FC<UserPermissionEditorProps> = ({
  open,
  onClose,
  userId,
  userName,
}) => {
  const queryClient = useQueryClient();
  const [permissions, setPermissions] = useState<Map<string, PermissionConfig>>(
    new Map()
  );

  const { data: userPermsData, isLoading: isLoadingUserPerms } = useQuery({
    queryKey: ["user-permissions", userId],
    queryFn: () => getUserPermissions(userId),
    enabled: open && !!userId,
  });

  const { data: allPermsData } = useQuery({
    queryKey: ["permissions-by-category"],
    queryFn: getPermissionsByCategory,
    enabled: open,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      permissionsGranted,
      permissionsDenied,
    }: {
      permissionsGranted: string[];
      permissionsDenied: string[];
    }) =>
      bulkUpdateUserPermissions(userId, permissionsGranted, permissionsDenied),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Permissions updated successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update permissions"
      );
    },
  });

  // Initialize permissions state when data loads
  useEffect(() => {
    if (!userPermsData?.data || !allPermsData?.data) return;

    const newPermissions = new Map<string, PermissionConfig>();

    // Get all role permission IDs
    const rolePermissionIds = new Set(
      userPermsData.data.rolePermissions?.map((p: Permission) => p._id) || []
    );

    // Get explicitly granted permission IDs
    const grantedIds = new Set(
      userPermsData.data.permissionsGranted?.map((p: Permission) => p._id) || []
    );

    // Get explicitly denied permission IDs
    const deniedIds = new Set(
      userPermsData.data.permissionsDenied?.map((p: Permission) => p._id) || []
    );

    // Initialize all permissions
    allPermsData.data.forEach((category: any) => {
      category.permissions.forEach((perm: Permission) => {
        const fromRole = rolePermissionIds.has(perm._id);
        let state: PermissionState = "default";

        if (grantedIds.has(perm._id)) {
          state = "granted";
        } else if (deniedIds.has(perm._id)) {
          state = "denied";
        }

        newPermissions.set(perm._id, {
          permissionId: perm._id,
          state,
          fromRole,
        });
      });
    });

    setPermissions(newPermissions);
  }, [userPermsData, allPermsData]);

  const handlePermissionChange = (
    permId: string,
    newState: PermissionState
  ) => {
    setPermissions((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(permId);
      if (current) {
        newMap.set(permId, { ...current, state: newState });
      }
      return newMap;
    });
  };

  const handleSave = () => {
    const permissionsGranted: string[] = [];
    const permissionsDenied: string[] = [];

    permissions.forEach((config) => {
      if (config.state === "granted") {
        permissionsGranted.push(config.permissionId);
      } else if (config.state === "denied") {
        permissionsDenied.push(config.permissionId);
      }
    });

    updateMutation.mutate({ permissionsGranted, permissionsDenied });
  };

  const getPermissionState = (permId: string): PermissionState => {
    return permissions.get(permId)?.state || "default";
  };

  const isFromRole = (permId: string): boolean => {
    return permissions.get(permId)?.fromRole || false;
  };

  const getStateLabel = (permId: string): string => {
    const config = permissions.get(permId);
    if (!config) {
      return "Loading...";
    }

    const state = config.state;
    const fromRole = config.fromRole;

    if (state === "granted") {
      return "Explicitly Granted";
    } else if (state === "denied") {
      return "Explicitly Denied";
    } else if (fromRole) {
      return "From Role";
    }
    return "Not Assigned";
  };

  const getStateColor = (permId: string) => {
    const state = getPermissionState(permId);
    const fromRole = isFromRole(permId);

    if (state === "granted") return "success";
    if (state === "denied") return "error";
    if (fromRole) return "info";
    return "default";
  };

  const hasEffectivePermission = (permId: string): boolean => {
    const state = getPermissionState(permId);
    const fromRole = isFromRole(permId);

    // Explicitly denied overrides everything
    if (state === "denied") return false;

    // Explicitly granted
    if (state === "granted") return true;

    // From role (default state)
    if (fromRole) return true;

    return false;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Manage Permissions - {userName}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {isLoadingUserPerms || permissions.size === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography>Loading permissions...</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure user-specific permission overrides. Permissions marked
              "From Role" are inherited from the user's role. You can explicitly
              grant or deny any permission, which will override the role's
              default.
            </Typography>

            {allPermsData?.data?.map((category: any) => (
              <Accordion
                key={category.category}
                defaultExpanded
                sx={{
                  mb: 1,
                  "&:before": {
                    display: "none",
                  },
                  boxShadow: "none",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    minHeight: 48,
                    "&.Mui-expanded": {
                      minHeight: 48,
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    textTransform="capitalize"
                  >
                    {category.category} ({category.permissions.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ py: 1 }}>
                  <List dense sx={{ px: 0 }}>
                    {category.permissions.map((perm: Permission) => {
                      const state = getPermissionState(perm._id);
                      const fromRole = isFromRole(perm._id);
                      const hasPermission = hasEffectivePermission(perm._id);

                      return (
                        <ListItem
                          key={perm._id}
                          sx={{
                            py: 0.5,
                            px: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                        >
                          {/* Permission Status Indicator */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              minWidth: 28,
                            }}
                          >
                            {hasPermission ? (
                              <CheckCircle
                                sx={{
                                  fontSize: 20,
                                  color: "success.main",
                                }}
                              />
                            ) : (
                              <Cancel
                                sx={{
                                  fontSize: 20,
                                  color: "error.light",
                                }}
                              />
                            )}
                          </Box>

                          {/* Permission Name and Key */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {perm.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                              }}
                            >
                              {perm.key}
                            </Typography>
                          </Box>

                          {/* Status Chip */}
                          <Chip
                            label={getStateLabel(perm._id)}
                            size="small"
                            color={getStateColor(perm._id) as any}
                            sx={{
                              minWidth: 110,
                              height: 22,
                              fontSize: "0.7rem",
                            }}
                          />

                          {/* Radio Buttons as Checkboxes */}
                          <FormControl component="fieldset">
                            <RadioGroup
                              row
                              value={state}
                              onChange={(e) =>
                                handlePermissionChange(
                                  perm._id,
                                  e.target.value as PermissionState
                                )
                              }
                              sx={{ gap: 0.5 }}
                            >
                              <FormControlLabel
                                value="default"
                                control={
                                  <CheckboxRadio
                                    icon={
                                      <Box
                                        sx={{
                                          width: 20,
                                          height: 20,
                                          border: "2px solid",
                                          borderColor: "divider",
                                          borderRadius: "4px",
                                        }}
                                      />
                                    }
                                    checkedIcon={
                                      <Box
                                        sx={{
                                          width: 20,
                                          height: 20,
                                          border: "2px solid",
                                          borderColor: "primary.main",
                                          borderRadius: "4px",
                                          bgcolor: "primary.main",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Check
                                          sx={{
                                            fontSize: 16,
                                            color: "white",
                                          }}
                                        />
                                      </Box>
                                    }
                                  />
                                }
                                label={
                                  <Typography variant="caption">
                                    Default
                                  </Typography>
                                }
                                sx={{ mr: 1 }}
                              />
                              <FormControlLabel
                                value="granted"
                                control={
                                  <CheckboxRadio
                                    icon={
                                      <Box
                                        sx={{
                                          width: 20,
                                          height: 20,
                                          border: "2px solid",
                                          borderColor: "divider",
                                          borderRadius: "4px",
                                        }}
                                      />
                                    }
                                    checkedIcon={
                                      <Box
                                        sx={{
                                          width: 20,
                                          height: 20,
                                          border: "2px solid",
                                          borderColor: "success.main",
                                          borderRadius: "4px",
                                          bgcolor: "success.main",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Check
                                          sx={{
                                            fontSize: 16,
                                            color: "white",
                                          }}
                                        />
                                      </Box>
                                    }
                                  />
                                }
                                label={
                                  <Typography
                                    variant="caption"
                                    color="success.main"
                                  >
                                    Allow
                                  </Typography>
                                }
                                sx={{ mr: 1 }}
                              />
                              <FormControlLabel
                                value="denied"
                                control={
                                  <CheckboxRadio
                                    icon={
                                      <Box
                                        sx={{
                                          width: 20,
                                          height: 20,
                                          border: "2px solid",
                                          borderColor: "divider",
                                          borderRadius: "4px",
                                        }}
                                      />
                                    }
                                    checkedIcon={
                                      <Box
                                        sx={{
                                          width: 20,
                                          height: 20,
                                          border: "2px solid",
                                          borderColor: "error.main",
                                          borderRadius: "4px",
                                          bgcolor: "error.main",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Check
                                          sx={{
                                            fontSize: 16,
                                            color: "white",
                                          }}
                                        />
                                      </Box>
                                    }
                                  />
                                }
                                label={
                                  <Typography
                                    variant="caption"
                                    color="error.main"
                                  >
                                    Deny
                                  </Typography>
                                }
                              />
                            </RadioGroup>
                          </FormControl>
                        </ListItem>
                      );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updateMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserPermissionEditor;
