import { Box, Paper, Typography, Button, InputAdornment } from "@mui/material";
import { Lock } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Input } from "../../../shared/components/forms";
import api from "../../../lib/axios";

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "New password must be different",
  });

type FormData = z.infer<typeof schema>;

export const ChangePasswordSection = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t("profile.passwordChanged"));
      reset();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || t("profile.passwordChangeFailed")
      );
    },
  });

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Lock color="primary" />
        <Typography variant="h6" fontWeight={700}>
          {t("profile.changePassword")}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("profile.changePasswordHint")}
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
      >
        <Input
          fullWidth
          type="password"
          label={t("profile.currentPassword")}
          autoComplete="current-password"
          {...register("currentPassword")}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Input
          fullWidth
          type="password"
          label={t("auth.newPassword")}
          autoComplete="new-password"
          {...register("newPassword")}
          error={!!errors.newPassword}
          helperText={errors.newPassword?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Input
          fullWidth
          type="password"
          label={t("auth.confirmPassword")}
          autoComplete="new-password"
          {...register("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending}
          sx={{
            background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
          }}
        >
          {mutation.isPending
            ? t("common.loading")
            : t("profile.updatePassword")}
        </Button>
      </Box>
    </Paper>
  );
};
