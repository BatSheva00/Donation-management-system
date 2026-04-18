import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  LinearProgress,
  alpha,
} from "@mui/material";
import { ArrowUpward } from "@mui/icons-material";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export const StatsCard = ({
  title,
  value,
  change,
  icon,
  color,
  bgColor,
}: StatsCardProps) => {
  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: bgColor,
              color: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <Chip
            label={change}
            size="small"
            icon={<ArrowUpward sx={{ fontSize: 14 }} />}
            sx={{
              bgcolor: alpha("#10b981", 0.1),
              color: "#10b981",
              fontWeight: 600,
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={0}
          sx={{
            mt: 2,
            height: 4,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            "& .MuiLinearProgress-bar": {
              bgcolor: color,
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

