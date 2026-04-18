import { Box, Typography, Avatar, Chip } from "@mui/material";
import { getProfileImageUrl, getUserInitials } from "../../../utils/userUtils";

interface WelcomeHeaderProps {
  user: any;
  roleBadgeColor: string;
  t: any;
}

export const WelcomeHeader = ({
  user,
  roleBadgeColor,
  t,
}: WelcomeHeaderProps) => {
  // Get the year the user joined (from createdAt or default to current year)
  const memberSinceYear = user?.createdAt 
    ? new Date(user.createdAt).getFullYear() 
    : new Date().getFullYear();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <Avatar
        src={getProfileImageUrl(user) || undefined}
        sx={{
          width: 64,
          height: 64,
          background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
          fontSize: "1.5rem",
          fontWeight: 700,
        }}
      >
        {getUserInitials(user)}
      </Avatar>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          {t("dashboard.welcomeBack")}, {user?.firstName}! 👋
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 0.5,
          }}
        >
          <Chip
            label={user?.role?.name || user?.role?.key}
            size="small"
            sx={{
              bgcolor: roleBadgeColor,
              color: "white",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {t("dashboard.memberSince")} {memberSinceYear}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

