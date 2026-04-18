import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Typography,
  Link as MuiLink,
  Divider,
  CircularProgress,
  Grid,
  Paper,
  alpha,
} from "@mui/material";
import { ArrowForward, ArrowBack, Favorite } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import api from "../../lib/axios";
import {
  RoleSelector,
  RegisterFormFields,
  VerificationDialog,
} from "./components";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(10, "Phone number is required"),
  roleKey: z.enum(["user", "business", "driver"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const [loading, setLoading] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    userId: string;
    email: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      roleKey: "user",
      phoneNumber: "",
    },
  });

  const selectedRole = watch("roleKey");

  const onSubmit = async (
    data: RegisterFormData,
    event?: React.BaseSyntheticEvent
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    try {
      setLoading(true);

      // Phone number comes in format: "+972-489145665"
      const phoneStr = data.phoneNumber || "";
      const phoneParts = phoneStr.split("-");
      
      if (phoneParts.length < 2 || !phoneParts[0].startsWith("+")) {
        toast.error(
          "❌ INVALID PHONE NUMBER - Please enter a valid phone number",
          {
            autoClose: 1000,
            closeButton: true,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
          }
        );
        setLoading(false);
        return;
      }

      const countryCode = phoneParts[0]; // "+972"
      const number = phoneParts.slice(1).join("").replace(/[\s\-()]/g, ""); // "489145665"

      const requestData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: {
          countryCode: countryCode,
          number: number,
        },
        roleKey: data.roleKey,
      };

      const response = await api.post("/auth/register", requestData);

      if (response.data.data.needsEmailVerification) {
        setVerificationData({
          userId: response.data.data.userId,
          email: response.data.data.email,
        });
        setVerificationDialogOpen(true);
        toast.success("Registration successful! Please verify your email.");
      }
    } catch (error) {
      toast.error(
        (error as any).response?.data?.message || "Registration failed",
        {
          autoClose: 5000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          py: 4,
        }}
      >
        <Box maxWidth="lg" sx={{ mx: "auto", width: "100%", px: 2 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left Side - Branding */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(53, 147, 100, 0.3)",
                  }}
                >
                  <Favorite sx={{ color: "white", fontSize: 28 }} />
                </Box>
                <Typography variant="h4" fontWeight={800} color="primary">
                  {t("common.kindLoop")}
                </Typography>
              </Box>

              <Typography
                variant="h3"
                fontWeight={800}
                sx={{ lineHeight: 1.2 }}
              >
                {t("auth.createFreeAccount")}
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: "1.1rem" }}
              >
                {t("auth.chooseRole")}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {t("auth.whyJoin")}
                </Typography>
                {[
                  { icon: "✓", text: t("auth.makeImpact") },
                  { icon: "✓", text: t("auth.connectCommunity") },
                  { icon: "✓", text: t("auth.freePlatform") },
                  { icon: "✓", text: t("auth.trackContributions") },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: alpha("#359364", 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "primary.main",
                        fontWeight: 700,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography variant="body2">{item.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Right Side - Registration Form */}
            <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {t("auth.register")}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t("auth.credentials")}
                  </Typography>
                </Box>

                <Box
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(onSubmit)(e);
                  }}
                  noValidate
                >
                  <RoleSelector control={control} name="roleKey" />

                  <RegisterFormFields
                    register={register}
                    errors={errors}
                    control={control}
                    selectedRole={selectedRole}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? null : (isRTL ? <ArrowBack /> : null)}
                    endIcon={loading ? null : (isRTL ? null : <ArrowForward />)}
                    sx={{
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                      background:
                        "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                      boxShadow: "0 4px 12px rgba(53, 147, 100, 0.3)",
                      "&:hover": {
                        boxShadow: "0 6px 16px rgba(53, 147, 100, 0.4)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      t("auth.register")
                    )}
                  </Button>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("common.or")}
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("auth.alreadyHaveAccount")}{" "}
                      <MuiLink
                        component={Link}
                        to="/login"
                        sx={{
                          color: "primary.main",
                          fontWeight: 600,
                          textDecoration: "none",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {t("auth.login")}
                      </MuiLink>
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Email Verification Dialog */}
      <VerificationDialog
        open={verificationDialogOpen}
        onClose={() => setVerificationDialogOpen(false)}
        userId={verificationData?.userId}
        email={verificationData?.email}
      />
    </>
  );
};

export default RegisterPage;
