import {
  Box,
  Button,
  InputAdornment,
  Divider,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import { Email, Lock, ArrowForward } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "../../shared/components/forms";
import { useLogin } from "./hooks";
import { AuthLayout, AuthFormContainer } from "./components";

const LoginPage = () => {
  const { t } = useTranslation();
  const { form, loading, onSubmit } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <AuthLayout
      title={t("auth.welcomeBack")}
      subtitle={t("auth.continueMaking")}
      benefits={[
        t("dashboard.totalDonations"),
        t("auth.connectCommunity"),
        t("auth.makeImpact"),
      ]}
    >
      <AuthFormContainer
        title={t("auth.signIn")}
        subtitle={t("auth.credentials")}
      >
        <Box component="form" onSubmit={onSubmit}>
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
            sx={{
              mb: 2,
              "& .MuiInputBase-input": {
                paddingLeft: "52px !important",
              },
              "& .MuiInputAdornment-positionStart": {
                position: "absolute",
                left: "16px",
                zIndex: 1,
              },
              '[dir="rtl"] &': {
                "& .MuiInputBase-input": {
                  paddingLeft: "16px !important",
                  paddingRight: "52px !important",
                },
                "& .MuiInputAdornment-positionStart": {
                  left: "auto",
                  right: "16px",
                },
              },
            }}
          />

          <Input
            fullWidth
            type="password"
            label={t("auth.password")}
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
            sx={{
              mb: 1,
              "& .MuiInputBase-input": {
                paddingLeft: "52px !important",
              },
              "& .MuiInputAdornment-positionStart": {
                position: "absolute",
                left: "16px",
                zIndex: 1,
              },
              '[dir="rtl"] &': {
                "& .MuiInputBase-input": {
                  paddingLeft: "52px !important",
                  paddingRight: "52px !important",
                },
                "& .MuiInputAdornment-positionStart": {
                  left: "auto",
                  right: "16px",
                },
              },
            }}
          />

          <Box sx={{ textAlign: "right", mb: 3 }}>
            <MuiLink
              component={Link}
              to="/forgot-password"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {t("auth.forgotPassword")}
            </MuiLink>
          </Box>

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
              boxShadow: "0 4px 12px rgba(53, 147, 100, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #24754f 0%, #1a5a3d 100%)",
                boxShadow: "0 6px 16px rgba(53, 147, 100, 0.4)",
              },
            }}
          >
            {loading ? t("common.loading") : t("auth.signIn")}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {t("auth.dontHaveAccount")}{" "}
              <MuiLink
                component={Link}
                to="/register"
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {t("auth.signUp")}
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </AuthFormContainer>
    </AuthLayout>
  );
};

export default LoginPage;
