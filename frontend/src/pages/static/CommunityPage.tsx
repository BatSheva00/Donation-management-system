import { Box, Container, Typography, Grid, Paper, alpha, Button, Avatar, AvatarGroup, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Groups,
  Favorite,
  EmojiEvents,
  TrendingUp,
  ArrowForward,
  Star,
} from "@mui/icons-material";
import { statisticsService } from "../../shared/services/statisticsService";

const CommunityPage = () => {
  const { t } = useTranslation();

  // Fetch real system stats
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ["systemStats"],
    queryFn: statisticsService.getSystemStats,
  });

  const stats = [
    { 
      value: systemStats?.users?.total?.toLocaleString() || "0", 
      label: t("static.community.stats.activeMembers"), 
      icon: <Groups /> 
    },
    { 
      value: systemStats?.totalDonations?.toLocaleString() || "0", 
      label: t("static.community.stats.donationsMade"), 
      icon: <Favorite /> 
    },
    { 
      value: systemStats?.totalUsers?.toLocaleString() || "0", 
      label: t("static.community.stats.activeUsers"), 
      icon: <EmojiEvents /> 
    },
    { 
      value: systemStats?.totalRequests?.toLocaleString() || "0", 
      label: t("static.community.stats.partnerOrgs"), 
      icon: <TrendingUp /> 
    },
  ];

  const stories = [
    {
      name: t("static.community.storyItems.story1Name"),
      role: t("static.community.storyItems.story1Role"),
      story: t("static.community.storyItems.story1"),
      avatar: "ר",
    },
    {
      name: t("static.community.storyItems.story2Name"),
      role: t("static.community.storyItems.story2Role"),
      story: t("static.community.storyItems.story2"),
      avatar: "מ",
    },
    {
      name: t("static.community.storyItems.story3Name"),
      role: t("static.community.storyItems.story3Role"),
      story: t("static.community.storyItems.story3"),
      avatar: "ד",
    },
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
            {t("static.community.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: "auto", lineHeight: 1.8 }}
          >
            {t("static.community.subtitle")}
          </Typography>
        </Box>

        {/* Stats */}
        {statsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: alpha("#359364", 0.1),
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="primary.main">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Community Stories */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ mb: 2, textAlign: "center" }}
          >
            {t("static.community.stories")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, textAlign: "center" }}
          >
            {t("static.community.storiesSubtitle")}
          </Typography>
          <Grid container spacing={3}>
            {stories.map((story, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 0.5, mb: 2 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} sx={{ color: "#f59e0b", fontSize: 20 }} />
                    ))}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ mb: 3, flex: 1, fontStyle: "italic", lineHeight: 1.8 }}
                  >
                    "{story.story}"
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", fontWeight: 700 }}>
                      {story.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={700}>
                        {story.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {story.role}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Join CTA */}
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <AvatarGroup
            max={5}
            sx={{
              justifyContent: "center",
              mb: 3,
              "& .MuiAvatar-root": {
                border: "2px solid white",
                width: 48,
                height: 48,
              },
            }}
          >
            {["A", "B", "C", "D", "E", "F"].map((letter) => (
              <Avatar key={letter} sx={{ bgcolor: alpha("#fff", 0.2) }}>
                {letter}
              </Avatar>
            ))}
          </AvatarGroup>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            {t("static.community.joinCommunity")}
          </Typography>
          <Typography sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: "auto" }}>
            {t("static.community.joinSubtitle")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{
              bgcolor: "white",
              color: "primary.main",
              px: 4,
              py: 1.5,
              "&:hover": {
                bgcolor: alpha("#fff", 0.9),
              },
            }}
          >
            {t("common.register")}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default CommunityPage;

