import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../../lib/axios";

export const useEmailVerification = (userId?: string) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string, inputRefs: any[]) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, inputRefs: any[]) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
  };

  const handleSubmit = async () => {
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/verify-email", {
        userId,
        code: fullCode,
      });
      toast.success("Email verified successfully! Please login.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification failed");
      setCode(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    try {
      setResendLoading(true);
      await api.post("/auth/resend-code", { userId });
      toast.success("Verification code sent!");
      setCountdown(60);
      setCode(["", "", "", "", "", ""]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  return {
    code,
    setCode,
    loading,
    resendLoading,
    countdown,
    handleCodeChange,
    handleKeyDown,
    handlePaste,
    handleSubmit,
    handleResendCode,
  };
};

