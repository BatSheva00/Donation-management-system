import { forwardRef } from "react";
import {
  TextField,
  TextFieldProps,
  alpha,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";

export interface InputProps extends Omit<TextFieldProps, "variant"> {
  variant?: "outlined" | "filled" | "standard";
}

/**
 * Styled Input component with consistent design
 * Supports all standard TextField props and integrates with react-hook-form
 */
const Input = forwardRef<HTMLDivElement, InputProps>((props, ref) => {
  const { type, variant = "outlined", ...rest } = props;
  const [showPassword, setShowPassword] = useState(false);

  // Handle password visibility toggle
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <TextField
      ref={ref}
      type={inputType}
      variant={variant}
      {...rest}
      inputProps={{
        ...rest.inputProps,
        required: false, // Disable browser validation, we use zod
      }}
      InputProps={{
        ...rest.InputProps,
        endAdornment: isPassword ? (
          <InputAdornment position="end">
            <IconButton
              type="button"
              aria-label="toggle password visibility"
              onClick={() => setShowPassword(!showPassword)}
              onMouseDown={(e) => e.preventDefault()}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ) : (
          rest.InputProps?.endAdornment
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          transition: "all 0.2s",
          "& fieldset": {
            borderColor: alpha("#000", 0.12),
            transition: "border-color 0.2s",
          },
          "&:hover fieldset": {
            borderColor: alpha("#359364", 0.3),
          },
          "&.Mui-focused fieldset": {
            borderColor: "#359364",
            borderWidth: 2,
          },
          "&.Mui-error fieldset": {
            borderColor: "#d32f2f",
          },
        },
        "& .MuiInputLabel-root": {
          "&.Mui-focused": {
            color: "#359364",
            fontWeight: 600,
          },
          "&.Mui-error": {
            color: "#d32f2f",
          },
        },
        "& .MuiInputBase-input": {
          py: 1.5,
        },
        "& .MuiFormHelperText-root": {
          marginInlineStart: 0,
          marginInlineEnd: 0,
          mt: 0.75,
          fontSize: "0.875rem",
          textAlign: "start",
          "&.Mui-error": {
            color: "#d32f2f",
          },
        },
        ...rest.sx,
      }}
    />
  );
});

Input.displayName = "Input";

export default Input;
