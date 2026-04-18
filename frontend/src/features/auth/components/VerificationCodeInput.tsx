import { Box, alpha } from "@mui/material";
import { useRef, useEffect } from "react";

interface VerificationCodeInputProps {
  code: string[];
  onCodeChange: (index: number, value: string, inputRefs: any[]) => void;
  onKeyDown?: (index: number, e: React.KeyboardEvent<HTMLInputElement>, inputRefs: any[]) => void;
  onPaste?: (e: React.ClipboardEvent) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const VerificationCodeInput = ({
  code,
  onCodeChange,
  onKeyDown,
  onPaste,
  disabled,
  autoFocus = true,
}: VerificationCodeInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  return (
    <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
      {code.map((digit, index) => (
        <Box
          key={index}
          component="input"
          ref={(el: any) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e: any) => onCodeChange(index, e.target.value, inputRefs.current)}
          onKeyDown={(e: any) => onKeyDown?.(index, e, inputRefs.current)}
          onPaste={onPaste}
          sx={{
            width: 48,
            height: 56,
            fontSize: "20px",
            fontWeight: 700,
            textAlign: "center",
            border: "2px solid",
            borderColor: digit ? "primary.main" : "divider",
            borderRadius: 2,
            bgcolor: digit ? alpha("#359364", 0.04) : "background.paper",
            outline: "none",
            transition: "all 0.2s",
            "&:focus": {
              borderColor: "primary.main",
              boxShadow: `0 0 0 3px ${alpha("#359364", 0.1)}`,
            },
            "&:disabled": {
              opacity: 0.5,
              cursor: "not-allowed",
            },
          }}
        />
      ))}
    </Box>
  );
};

