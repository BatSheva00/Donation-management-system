import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { MarkEmailRead, ArrowForward, ArrowBack, Refresh } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useEmailVerification } from "./hooks";

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const userId = location.state?.userId;
  const email = location.state?.email;

  const {
    code,
    loading,
    resendLoading,
    countdown,
    handleCodeChange,
    handleKeyDown,
    handlePaste,
    handleSubmit,
    handleResendCode,
  } = useEmailVerification(userId);

  // Auto-focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (!userId || !email) {
      toast.error(t("auth.invalidVerificationLink"));
      navigate("/register");
    }
  }, [userId, email, navigate, t]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
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
          </Box>

          <Box
            sx={{ display: "flex", gap: 1.5, justifyContent: "center", mb: 3 }}
          >
            {code.map((digit, index) => (
              <Box
                key={index}
                component="input"
                ref={(el: any) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e: any) =>
                  handleCodeChange(index, e.target.value, inputRefs.current)
                }
                onKeyDown={(e: any) => {
                  handleKeyDown(index, e, inputRefs.current);
                  // Submit on Enter when all digits are filled
                  if (e.key === "Enter" && code.every((d) => d)) {
                    handleSubmit();
                  }
                }}
                onPaste={handlePaste}
                sx={{
                  width: 48,
                  height: 56,
                  fontSize: "20px",
                  fontWeight: 700,
                  textAlign: "center",
                  border: "2px solid",
                  borderColor: digit ? "primary.main" : "divider",
                  borderRadius: 2,
                  bgcolor: digit
                    ? "rgba(53, 147, 100, 0.04)"
                    : "background.paper",
                  outline: "none",
                  transition: "all 0.2s",
                  "&:focus": {
                    borderColor: "primary.main",
                    boxShadow: "0 0 0 3px rgba(53, 147, 100, 0.1)",
                  },
                }}
              />
            ))}
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading || code.some((d) => !d)}
            startIcon={isRTL && !loading ? <ArrowBack /> : null}
            endIcon={
              loading ? (
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
            {loading ? t("auth.verifying") : t("auth.verifyEmail")}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("auth.didntReceiveCode")}
            </Typography>
            <Button
              variant="text"
              onClick={handleResendCode}
              disabled={countdown > 0 || resendLoading}
              startIcon={
                resendLoading ? <CircularProgress size={16} /> : <Refresh />
              }
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
        </Paper>
      </Container>
    </Box>
  );
};

export default EmailVerificationPage;
