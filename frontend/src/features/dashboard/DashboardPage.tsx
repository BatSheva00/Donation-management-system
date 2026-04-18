import { Container, Box, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../shared/stores/authStore";
import { useDashboardStats } from "./hooks/useDashboardStats";
import {
  StatsCard,
  WelcomeHeader,
  ImpactCard,
  RecentActivityCard,
  QuickActionsCard,
} from "./components";

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { stats, userStats, loading, recentActivity, getRoleBadgeColor } =
    useDashboardStats();

  const roleBadgeColor = getRoleBadgeColor(user?.role?.key || "");

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <WelcomeHeader
                user={user}
                roleBadgeColor={roleBadgeColor}
                t={t}
              />
              <Typography variant="body1" color="text.secondary">
                {t("dashboard.happeningToday")}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <ImpactCard t={t} userStats={userStats} loading={loading} />
            </Grid>
          </Grid>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatsCard
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                color={stat.color}
                bgColor={stat.bgColor}
              />
            </Grid>
          ))}
        </Grid>

        {/* Activity and Actions */}
        <Grid container spacing={3}>
          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <RecentActivityCard t={t} />
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <QuickActionsCard t={t} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;
