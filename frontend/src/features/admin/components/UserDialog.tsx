import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createUser,
  updateUser,
  getAllRoles,
  type User,
} from "../../../shared/services/userService";
import { toast } from "react-toastify";

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const UserDialog: React.FC<UserDialogProps> = ({ open, onClose, user }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    roleId: "",
    status: "active",
    language: "en",
    phone: "",
  });

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getAllRoles(),
    enabled: open,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: "",
        firstName: user.firstName,
        lastName: user.lastName,
        roleId:
          typeof user.role === "string" ? user.role : user.role?._id || "",
        status: user.status,
        language: user.language,
        phone: "",
      });
    } else {
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        roleId: "",
        status: "active",
        language: "en",
        phone: "",
      });
    }
  }, [user, open]);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const handleSubmit = () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user && !formData.password) {
      toast.error("Password is required for new users");
      return;
    }

    const submitData: any = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      roleId: formData.roleId,
      status: formData.status,
      language: formData.language,
    };

    if (formData.phone) {
      submitData.phone = formData.phone;
    }

    if (!user) {
      submitData.password = formData.password;
      createMutation.mutate(submitData);
    } else {
      updateMutation.mutate({ id: user._id, data: submitData });
    }
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
            {user ? "Edit User" : "Create New User"}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              fullWidth
              required
              disabled={!!user}
            />
          </Grid>
          {!user && (
            <Grid item xs={12}>
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                fullWidth
                required
                helperText="Minimum 8 characters"
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Role"
              value={formData.roleId}
              onChange={(e) =>
                setFormData({ ...formData, roleId: e.target.value })
              }
              fullWidth
              required
            >
              {rolesData?.data?.map((role: any) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="pending_verification">
                Pending Verification
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Language"
              value={formData.language}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="he">עברית</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Phone (Optional)"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={createMutation.isPending || updateMutation.isPending}
          sx={{
            background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
          }}
        >
          {user ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog;
