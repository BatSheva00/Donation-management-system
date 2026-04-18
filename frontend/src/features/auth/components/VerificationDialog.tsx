import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { MarkEmailRead, ArrowBack, ArrowForward, Refresh } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../../lib/axios";
import { VerificationCodeInput } from "./VerificationCodeInput";

interface VerificationDialogProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  email?: string;
}

export const VerificationDialog = ({
  open,
  onClose,
  userId,
  email,
}: VerificationDialogProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string, inputRefs: any[]) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value.slice(-1);
    setVerificationCode(newCode);
    if (value && index < 5) {
      inputRefs[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, inputRefs: any[]) => {
    // Handle Enter key to submit
    if (e.key === "Enter") {
      e.preventDefault();
      const fullCode = verificationCode.join("");
      if (fullCode.length === 6) {
        handleVerify();
      }
    }
    // Handle Backspace to go to previous input
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = verificationCode.join("");
    if (fullCode.length !== 6) {
      toast.error(t("auth.enterCompleteCode"));
      return;
    }

    try {
      setVerifyLoading(true);
      await api.post("/auth/verify-email", {
        userId,
        code: fullCode,
      });
      toast.success(t("auth.emailVerifiedSuccess"));
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("auth.verificationFailed"));
      setVerificationCode(["", "", "", "", "", ""]);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    try {
      setResendLoading(true);
      await api.post("/auth/resend-code", { userId });
      toast.success(t("auth.codeSent"));
      setCountdown(60);
      setVerificationCode(["", "", "", "", "", ""]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("auth.resendFailed"));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
        },
      }}
      sx={{
        "& .MuiBackdrop-root": {
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 4px 12px rgba(53, 147, 100, 0.3)",
          }}
        >
          <MarkEmailRead sx={{ fontSize: 32, color: "white" }} />
        </Box>
        <Typography variant="h5" fontWeight={700}>
          {t("auth.verifyYourEmail")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t("auth.enterCodeSentTo")}
          <br />
          <strong>{email}</strong>
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <VerificationCodeInput
            code={verificationCode}
            onCodeChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            disabled={verifyLoading}
            autoFocus
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleVerify}
          disabled={verifyLoading || verificationCode.some((d) => !d)}
          startIcon={isRTL && !verifyLoading ? <ArrowBack /> : null}
          endIcon={
            verifyLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : !isRTL ? (
              <ArrowForward />
            ) : null
          }
          sx={{
            py: 1.5,
            background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
            mb: 2,
          }}
        >
          {verifyLoading ? t("auth.verifying") : t("auth.verifyEmail")}
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t("auth.didntReceiveCode")}
          </Typography>
          <Button
            variant="text"
            onClick={handleResendCode}
            disabled={countdown > 0 || resendLoading}
            startIcon={resendLoading ? <CircularProgress size={16} /> : <Refresh />}
          >
            {countdown > 0 ? t("auth.resendIn", { seconds: countdown }) : t("auth.resendCode")}
          </Button>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", textAlign: "center", mt: 2 }}
        >
          {t("auth.testingCode")}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

