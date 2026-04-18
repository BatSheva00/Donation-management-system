import { forwardRef } from "react";
import {
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
  FormControlLabel,
  FormHelperText,
  Box,
  alpha,
} from "@mui/material";

export interface SwitchProps extends Omit<MuiSwitchProps, "color"> {
  label?: string;
  helperText?: string;
  error?: boolean;
  labelPlacement?: "start" | "end" | "top" | "bottom";
  color?: MuiSwitchProps["color"];
}

/**
 * Styled Switch component with consistent design
 * Supports all standard Switch props and integrates with react-hook-form
 */
const Switch = forwardRef<HTMLButtonElement, SwitchProps>((props, ref) => {
  const {
    label,
    helperText,
    error,
    labelPlacement = "end",
    color = "primary",
    sx,
    ...rest
  } = props;

  const switchComponent = (
    <MuiSwitch
      ref={ref}
      color={color}
      {...rest}
      sx={{
        "& .MuiSwitch-switchBase": {
          "&:hover": {
            bgcolor: alpha("#359364", 0.08),
          },
          "&.Mui-checked": {
            color: "#359364",
            "& + .MuiSwitch-track": {
              bgcolor: "#359364",
              opacity: 0.5,
            },
          },
        },
        "& .MuiSwitch-track": {
          borderRadius: 26 / 2,
        },
        ...sx,
      }}
    />
  );

  if (!label) {
    return switchComponent;
  }

  return (
    <Box>
      <FormControlLabel
        control={switchComponent}
        label={label}
        labelPlacement={labelPlacement}
        sx={{
          m: 0,
          "& .MuiFormControlLabel-label": {
            fontSize: "0.95rem",
            fontWeight: 500,
            color: error ? "#d32f2f" : "text.primary",
          },
        }}
      />
      {helperText && (
        <FormHelperText
          error={error}
          sx={{
            ml: 0,
            mt: 0.5,
            fontSize: "0.875rem",
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
});

Switch.displayName = "Switch";

export default Switch;
