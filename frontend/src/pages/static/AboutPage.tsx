import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  alpha,
  Avatar,
  Skeleton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Favorite, Groups, EmojiEvents, TrendingUp } from "@mui/icons-material";
import { useSystemStats } from "../../shared/hooks/useStatistics";
import { formatNumberCompact } from "../../shared/utils/formatNumber";

const AboutPage = () => {
  const { t, i18n } = useTranslation();
  const isHebrew = i18n.language === "he";
  const { stats: systemStats, loading: statsLoading } = useSystemStats();

  // Use real stats from API
  const stats = systemStats
    ? [
        {
          value: formatNumberCompact(systemStats.totalDonations),
          label: t("home.stats.donations"),
          icon: <Favorite />,
        },
        {
          value: formatNumberCompact(systemStats.totalUsers),
          label: t("home.stats.activeUsers"),
          icon: <Groups />,
        },
        {
          value: formatNumberCompact(systemStats.totalDrivers),
          label: t("home.stats.volunteers"),
          icon: <EmojiEvents />,
        },
        {
          value: formatNumberCompact(systemStats.totalBusinesses),
          label: t("home.stats.businesses"),
          icon: <TrendingUp />,
        },
      ]
    : [
        { value: "...", label: t("home.stats.donations"), icon: <Favorite /> },
        { value: "...", label: t("home.stats.activeUsers"), icon: <Groups /> },
        {
          value: "...",
          label: t("home.stats.volunteers"),
          icon: <EmojiEvents />,
        },
        { value: "...", label: t("home.stats.businesses"), icon: <TrendingUp /> },
      ];

  const values = [
    {
      title: t("static.about.valuesItems.communityFirst"),
      description: t("static.about.valuesItems.communityFirstDesc"),
    },
    {
      title: t("static.about.valuesItems.transparency"),
      description: t("static.about.valuesItems.transparencyDesc"),
    },
    {
      title: t("static.about.valuesItems.sustainability"),
      description: t("static.about.valuesItems.sustainabilityDesc"),
    },
    {
      title: t("static.about.valuesItems.accessibility"),
      description: t("static.about.valuesItems.accessibilityDesc"),
    },
  ];

  const team = [
    {
      name: "דור ויטמן",
      nameEn: "Dor Weitman",
      role: "מנהל פרוייקט",
      roleEn: "Project Manager",
      avatar: "ד",
    },
    {
      name: "דניאל קולוסובסקי",
      nameEn: "Daniel Kolosovsky",
      role: "מוביל טכנולוגי",
      roleEn: "Tech Lead",
      avatar: "ד",
    },
    {
      name: "בת שבע ביטוסי",
      nameEn: "Batsheva Bitusi",
      role: "מפתחת Fullstack",
      roleEn: "Fullstack Developer",
      avatar: "ב",
    },
    {
      name: "ירין אהרון",
      nameEn: "Yarin Aharon",
      role: "מפתח Fullstack",
      roleEn: "Fullstack Developer",
      avatar: "י",
    },
    {
      name: "פורת פיטוסי",
      nameEn: "Porat Pitusi",
      role: "מפתח Fullstack",
      roleEn: "Fullstack Developer",
      avatar: "פ",
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
            {t("static.about.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: "auto", lineHeight: 1.8 }}
          >
            {t("static.about.subtitle")}
          </Typography>
        </Box>

        {/* Mission */}
        <Paper
          elevation={0}
          sx={{
            p: 6,
            mb: 8,
            borderRadius: 4,
            background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
            {t("static.about.mission")}
          </Typography>
          <Typography
            variant="h6"
            sx={{ maxWidth: 800, mx: "auto", opacity: 0.95 }}
          >
            {t("static.about.missionText")}
          </Typography>
        </Paper>

        {/* Stats */}
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
                {statsLoading ? (
                  <Skeleton
                    variant="text"
                    width={80}
                    height={60}
                    sx={{ mx: "auto" }}
                  />
                ) : (
                  <Typography variant="h3" fontWeight={800} color="primary.main">
                    {stat.value}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Values */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ mb: 4, textAlign: "center" }}
          >
            {t("static.about.values")}
          </Typography>
          <Grid container spacing={3}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                    {value.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {value.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team */}
        <Box>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ mb: 4, textAlign: "center" }}
          >
            {t("static.about.team")}
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {team.map((member, index) => (
              <Grid item xs={6} sm={4} md={2.4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: "auto",
                      mb: 2,
                      bgcolor: "primary.main",
                      fontSize: "2rem",
                      fontWeight: 700,
                    }}
                  >
                    {isHebrew ? member.avatar : member.nameEn.charAt(0)}
                  </Avatar>
                  <Typography variant="h6" fontWeight={700}>
                    {isHebrew ? member.name : member.nameEn}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isHebrew ? member.role : member.roleEn}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage;
