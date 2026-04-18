import { Box, Container, Typography, Grid, Paper, alpha } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  VolunteerActivism,
  LocalShipping,
  Handshake,
  CheckCircle,
  Person,
  Business,
  DirectionsCar,
} from "@mui/icons-material";

const HowItWorksPage = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: <VolunteerActivism sx={{ fontSize: 48 }} />,
      title: t("home.donate"),
      description: t("home.donateDesc"),
      color: "#359364",
    },
    {
      icon: <Handshake sx={{ fontSize: 48 }} />,
      title: t("home.request"),
      description: t("home.requestDesc"),
      color: "#2563eb",
    },
    {
      icon: <LocalShipping sx={{ fontSize: 48 }} />,
      title: t("home.deliver"),
      description: t("home.deliverDesc"),
      color: "#dc2626",
    },
  ];

  const roles = [
    {
      icon: <Person sx={{ fontSize: 40 }} />,
      title: t("roles.user"),
      description: t("static.howItWorks.roles.userDesc"),
    },
    {
      icon: <Business sx={{ fontSize: 40 }} />,
      title: t("roles.business"),
      description: t("static.howItWorks.roles.businessDesc"),
    },
    {
      icon: <DirectionsCar sx={{ fontSize: 40 }} />,
      title: t("roles.driver"),
      description: t("static.howItWorks.roles.driverDesc"),
    },
  ];

  const benefits = [
    t("static.howItWorks.benefits.easyToUse"),
    t("static.howItWorks.benefits.realTimeTracking"),
    t("static.howItWorks.benefits.secureVerified"),
    t("static.howItWorks.benefits.communityDriven"),
    t("static.howItWorks.benefits.freeToUse"),
    t("static.howItWorks.benefits.multiLanguage"),
  ];

  return (
    <Box sx={{ py: 8, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ mb: 2, color: "text.primary" }}
          >
            {t("footer.howItWorks")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            {t("home.steps")}
          </Typography>
        </Box>

        {/* Steps */}
        <Grid container spacing={4} sx={{ mb: 10 }}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 4,
                  textAlign: "center",
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 20px 40px ${alpha(step.color, 0.15)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: alpha(step.color, 0.1),
                    color: step.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  {step.icon}
                </Box>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{ mb: 1, color: step.color }}
                >
                  {index + 1}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                  {step.title}
                </Typography>
                <Typography color="text.secondary">
                  {step.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Roles Section */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ mb: 2, textAlign: "center" }}
          >
            {t("auth.chooseRole")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 6, textAlign: "center", maxWidth: 600, mx: "auto" }}
          >
            {t("static.howItWorks.roles.joinAs")}
          </Typography>
          <Grid container spacing={3}>
            {roles.map((role, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: alpha("#359364", 0.1),
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {role.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                      {role.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Benefits */}
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
            color: "white",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mb: 4, textAlign: "center" }}
          >
            {t("static.howItWorks.whyChoose")}
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CheckCircle sx={{ color: alpha("#fff", 0.9) }} />
                  <Typography variant="body1" fontWeight={500}>
                    {benefit}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default HowItWorksPage;

