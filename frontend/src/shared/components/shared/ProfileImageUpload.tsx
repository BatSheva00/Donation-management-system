import { useRef } from "react";
import {
  Box,
  Avatar,
  IconButton,
  Typography,
  alpha,
  CircularProgress,
} from "@mui/material";
import { Delete, CameraAlt } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface ProfileImageUploadProps {
  currentImage?: string;
  userName?: string;
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  loading?: boolean;
  size?: number;
}

const ProfileImageUpload = ({
  currentImage,
  userName = "",
  onImageSelect,
  onImageRemove,
  loading = false,
  size = 150,
}: ProfileImageUploadProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert(t("profile.invalidImageType"));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t("profile.imageTooLarge"));
        return;
      }

      // Call parent handler - parent will handle preview creation
      onImageSelect(file);
    }
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageRemove?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    const names = userName.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
        }}
      >
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha("#000", 0.5),
              borderRadius: "50%",
              zIndex: 2,
            }}
          >
            <CircularProgress sx={{ color: "white" }} />
          </Box>
        )}

        <Avatar
          src={currentImage || undefined}
          sx={{
            width: size,
            height: size,
            fontSize: size / 3,
            fontWeight: 700,
            bgcolor: alpha("#359364", 0.1),
            color: "primary.main",
            border: "3px solid",
            borderColor: "primary.main",
            boxShadow: "0 4px 12px rgba(53, 147, 100, 0.2)",
            cursor: "pointer",
            transition: "all 0.3s",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 6px 20px rgba(53, 147, 100, 0.3)",
            },
          }}
          onClick={handleClick}
        >
          {!currentImage && getInitials()}
        </Avatar>

        {currentImage && (
          <IconButton
            size="small"
            onClick={handleRemove}
            sx={{
              position: "absolute",
              top: -5,
              insetInlineEnd: -5,
              bgcolor: "error.main",
              color: "white",
              width: 28,
              height: 28,
              "&:hover": {
                bgcolor: "error.dark",
              },
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <Delete sx={{ fontSize: 16 }} />
          </IconButton>
        )}

        {!currentImage && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              insetInlineEnd: 0,
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(53, 147, 100, 0.4)",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "primary.dark",
                transform: "scale(1.1)",
              },
            }}
            onClick={handleClick}
          >
            <CameraAlt sx={{ fontSize: "1rem" }} />
          </Box>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <Typography
        variant="caption"
        display="block"
        color="text.secondary"
        sx={{ textAlign: "center" }}
      >
        {t("profile.imageHint")}
      </Typography>
    </Box>
  );
};

export default ProfileImageUpload;
