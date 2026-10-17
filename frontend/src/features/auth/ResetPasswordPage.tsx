import { Box, Button, InputAdornment, Link as MuiLink } from "@mui/material";
import { Lock, ArrowForward } from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Input } from "../../shared/components/forms";
import api from "../../lib/axios";
import { AuthLayout, AuthFormContainer } from "./components";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error(t("auth.invalidResetLink"));
      return;
    }
    try {
      setLoading(true);
      await api.post(`/auth/reset-password/${token}`, {
        password: data.password,
      });
      toast.success(t("auth.passwordResetSuccess"));
      navigate("/login");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("auth.invalidResetLink");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.resetPasswordTitle")}
      subtitle={t("auth.resetPasswordSubtitle")}
    >
      <AuthFormContainer
        title={t("auth.resetPasswordTitle")}
        subtitle={t("auth.resetPasswordSubtitle")}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Input
            fullWidth
            type="password"
            label={t("auth.newPassword")}
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
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
            fullWidth
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            disabled={loading}
            sx={{
              py: 1.5,
              background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
            }}
          >
            {loading ? t("common.loading") : t("auth.resetPasswordTitle")}
          </Button>
        </Box>
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <MuiLink
            component={Link}
            to="/login"
            sx={{
              color: "primary.main",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {t("auth.backToLogin")}
          </MuiLink>
        </Box>
      </AuthFormContainer>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
