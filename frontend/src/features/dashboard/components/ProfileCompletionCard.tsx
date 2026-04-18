import {
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  alpha,
} from "@mui/material";

interface ProfileCompletionCardProps {
  completionPercentage?: number;
  t: any;
}

export const ProfileCompletionCard = ({
  completionPercentage = 60,
  t,
}: ProfileCompletionCardProps) => {
  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        color: "white",
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t("dashboard.profileCompletion")}
        </Typography>
        <Box sx={{ my: 2 }}>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha("#ffffff", 0.3),
              "& .MuiLinearProgress-bar": {
                bgcolor: "white",
              },
            }}
          />
        </Box>
        <Typography variant="h4" fontWeight={700}>
          {completionPercentage}%
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          {t("dashboard.completeProfile")}
        </Typography>
      </CardContent>
    </Card>
  );
};
