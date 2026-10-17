import { Box, Button, InputAdornment, Typography, Link as MuiLink } from "@mui/material";
import { Email, ArrowForward } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Input } from "../../shared/components/forms";
import api from "../../lib/axios";
import { AuthLayout, AuthFormContainer } from "./components";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", data);
      setSent(true);
      toast.success(t("auth.resetLinkSent"));
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("auth.resetLinkFailed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.forgotPasswordTitle")}
      subtitle={t("auth.forgotPasswordSubtitle")}
    >
      <AuthFormContainer
        title={t("auth.forgotPasswordTitle")}
        subtitle={t("auth.forgotPasswordSubtitle")}
      >
        {sent ? (
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            {t("auth.resetLinkSent")}
          </Typography>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Input
              fullWidth
              label={t("auth.email")}
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
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
              {loading ? t("common.loading") : t("auth.sendResetLink")}
            </Button>
          </Box>
        )}
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

export default ForgotPasswordPage;
