import { Card, CardContent, Box, Typography, Skeleton } from "@mui/material";
import { TrendingUp } from "@mui/icons-material";
import { UserStats } from "../../../shared/services/statisticsService";

interface ImpactCardProps {
  t: any;
  userStats?: UserStats | null;
  loading?: boolean;
}

export const ImpactCard = ({ t, userStats, loading }: ImpactCardProps) => {
  const monthlyHelped = userStats?.monthlyPeopleHelped ?? 0;

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
        color: "white",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
              {t("dashboard.yourImpact")}
            </Typography>
            {loading ? (
              <Skeleton
                variant="text"
                width={100}
                height={50}
                sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
              />
            ) : (
              <Typography variant="h4" fontWeight={700}>
                {monthlyHelped} {t("dashboard.people")}
              </Typography>
            )}
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              {t("dashboard.helpedThisMonth")}
            </Typography>
          </Box>
          <TrendingUp sx={{ fontSize: 48, opacity: 0.3 }} />
        </Box>
      </CardContent>
    </Card>
  );
};
