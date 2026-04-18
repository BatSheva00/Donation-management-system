import { Box, Container, Typography, Grid, Paper, alpha, TextField, Button, InputAdornment } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  Search,
  MenuBook,
  VideoLibrary,
  Forum,
  Email,
  Phone,
  LiveHelp,
  Article,
} from "@mui/icons-material";
import { useState } from "react";

const HelpPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: <MenuBook sx={{ fontSize: 32 }} />,
      title: t("static.help.categories.gettingStarted"),
      description: t("static.help.categories.gettingStartedDesc"),
      articles: 12,
    },
    {
      icon: <LiveHelp sx={{ fontSize: 32 }} />,
      title: t("static.help.categories.accountProfile"),
      description: t("static.help.categories.accountProfileDesc"),
      articles: 8,
    },
    {
      icon: <Article sx={{ fontSize: 32 }} />,
      title: t("static.help.categories.donations"),
      description: t("static.help.categories.donationsDesc"),
      articles: 15,
    },
    {
      icon: <Forum sx={{ fontSize: 32 }} />,
      title: t("static.help.categories.requests"),
      description: t("static.help.categories.requestsDesc"),
      articles: 10,
    },
    {
      icon: <VideoLibrary sx={{ fontSize: 32 }} />,
      title: t("static.help.categories.videoTutorials"),
      description: t("static.help.categories.videoTutorialsDesc"),
      articles: 6,
    },
    {
      icon: <Email sx={{ fontSize: 32 }} />,
      title: t("static.help.categories.contactSupport"),
      description: t("static.help.categories.contactSupportDesc"),
      articles: 3,
    },
  ];

  const popularArticles = [
    t("static.help.popularItems.createDonation"),
    t("static.help.popularItems.verifyAccount"),
    t("static.help.popularItems.donationStatuses"),
    t("static.help.popularItems.becomeDriver"),
    t("static.help.popularItems.updateProfile"),
  ];

  return (
    <Box sx={{ py: 8, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ mb: 2, color: "text.primary" }}
          >
            {t("static.help.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto", mb: 4 }}
          >
            {t("static.help.subtitle")}
          </Typography>

          {/* Search */}
          <TextField
            fullWidth
            placeholder={t("static.help.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              maxWidth: 600,
              "& .MuiOutlinedInput-root": {
                bgcolor: "white",
                borderRadius: 3,
                "& fieldset": {
                  borderColor: alpha("#000", 0.1),
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Categories */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {categories.map((category, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                    borderColor: "primary.main",
                  },
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
                    mb: 2,
                  }}
                >
                  {category.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  {category.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>
                <Typography variant="caption" color="primary.main" fontWeight={600}>
                  {category.articles} {t("static.help.articles")}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Popular Articles */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                {t("static.help.popularArticles")}
              </Typography>
              {popularArticles.map((article, index) => (
                <Box
                  key={index}
                  sx={{
                    py: 2,
                    borderBottom: index < popularArticles.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                    cursor: "pointer",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  <Typography variant="body1">{article}</Typography>
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Contact Support */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                color: "white",
              }}
            >
              <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                {t("static.help.needMoreHelp")}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                {t("static.help.supportTeamReady")}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Email />
                <Typography variant="body2">support@kindloop.com</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <Phone />
                <Typography variant="body2">+972-3-123-4567</Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: alpha("#fff", 0.9),
                  },
                }}
              >
                {t("footer.contactUs")}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HelpPage;

