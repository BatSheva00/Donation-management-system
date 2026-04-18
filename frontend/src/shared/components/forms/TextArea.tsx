import { forwardRef } from "react";
import { TextField, TextFieldProps, alpha } from "@mui/material";

export interface TextAreaProps
  extends Omit<TextFieldProps, "multiline" | "variant"> {
  variant?: "outlined" | "filled" | "standard";
  minRows?: number;
  maxRows?: number;
}

/**
 * Styled TextArea component with consistent design
 * Supports all standard TextField props and integrates with react-hook-form
 */
const TextArea = forwardRef<HTMLDivElement, TextAreaProps>((props, ref) => {
  const { variant = "outlined", minRows = 4, maxRows, ...rest } = props;

  return (
    <TextField
      ref={ref}
      multiline
      variant={variant}
      minRows={minRows}
      maxRows={maxRows}
      {...rest}
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
          ml: 0,
          mt: 0.75,
          fontSize: "0.875rem",
          "&.Mui-error": {
            color: "#d32f2f",
          },
        },
        ...rest.sx,
      }}
    />
  );
});

TextArea.displayName = "TextArea";

export default TextArea;
