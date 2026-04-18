import { Avatar, Box, Tooltip, alpha } from "@mui/material";
import { Verified } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface UserAvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: number;
  isVerified?: boolean;
  showBadge?: boolean;
  sx?: any;
  onClick?: () => void;
}

const UserAvatar = ({
  src,
  alt,
  initials = "?",
  size = 40,
  isVerified = false,
  showBadge = true,
  sx = {},
  onClick,
}: UserAvatarProps) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        width: size,
        height: size,
      }}
    >
      <Avatar
        src={src || undefined}
        alt={alt}
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          fontSize: size / 2.5,
          fontWeight: 600,
          bgcolor: alpha("#359364", 0.1),
          color: "primary.main",
          cursor: onClick ? "pointer" : "default",
          ...sx,
        }}
      >
        {!src && initials}
      </Avatar>

      {showBadge && isVerified && (
        <Tooltip title={t("profile.verifiedUser")} arrow placement="top">
          <Box
            sx={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: size * 0.35,
              height: size * 0.35,
              borderRadius: "50%",
              bgcolor: "#1DA1F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid white",
              boxShadow: "0 2px 8px rgba(29, 161, 242, 0.4)",
              zIndex: 1,
            }}
          >
            <Verified
              sx={{
                fontSize: size * 0.25,
                color: "white",
              }}
            />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default UserAvatar;




