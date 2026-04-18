import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
  Typography,
  alpha,
} from "@mui/material";
import {
  Warning,
  Info,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

type ConfirmationType = "warning" | "info" | "success" | "error";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  loading?: boolean;
}

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = "warning",
  loading = false,
}: ConfirmationDialogProps) => {
  const { t } = useTranslation();

  const getIcon = () => {
    switch (type) {
      case "warning":
        return <Warning sx={{ fontSize: 48, color: "#f59e0b" }} />;
      case "info":
        return <Info sx={{ fontSize: 48, color: "#3b82f6" }} />;
      case "success":
        return <CheckCircle sx={{ fontSize: 48, color: "#10b981" }} />;
      case "error":
        return <ErrorIcon sx={{ fontSize: 48, color: "#ef4444" }} />;
      default:
        return <Info sx={{ fontSize: 48, color: "#3b82f6" }} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case "warning":
        return "#f59e0b";
      case "info":
        return "#3b82f6";
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      default:
        return "#3b82f6";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            pt: 1,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: alpha(getColor(), 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {getIcon()}
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{
            color: "text.primary",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            pl: 9,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "text.secondary",
            "&:hover": {
              bgcolor: alpha("#000", 0.04),
            },
          }}
        >
          {cancelText || t("common.cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: getColor(),
            "&:hover": {
              bgcolor: getColor(),
              filter: "brightness(0.9)",
            },
            minWidth: 100,
          }}
        >
          {loading ? t("common.loading") : confirmText || t("common.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
