import { forwardRef } from "react";
import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  FormControlLabel,
  FormControlLabelProps,
  FormHelperText,
  Box,
  alpha,
} from "@mui/material";

export interface CheckboxProps extends Omit<MuiCheckboxProps, "color"> {
  label?: string;
  helperText?: string;
  error?: boolean;
  labelPlacement?: FormControlLabelProps["labelPlacement"];
  color?: MuiCheckboxProps["color"];
}

/**
 * Styled Checkbox component with consistent design
 * Supports all standard Checkbox props and integrates with react-hook-form
 */
const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>((props, ref) => {
  const {
    label,
    helperText,
    error,
    labelPlacement = "end",
    color = "primary",
    sx,
    ...rest
  } = props;

  const checkbox = (
    <MuiCheckbox
      ref={ref}
      color={color}
      {...rest}
      sx={{
        "&:hover": {
          bgcolor: alpha("#359364", 0.08),
        },
        "&.Mui-checked": {
          color: "#359364",
        },
        "&.Mui-disabled": {
          color: alpha("#000", 0.26),
        },
        ...sx,
      }}
    />
  );

  if (!label) {
    return checkbox;
  }

  return (
    <Box>
      <FormControlLabel
        control={checkbox}
        label={label}
        labelPlacement={labelPlacement}
        sx={{
          m: 0,
          "& .MuiFormControlLabel-label": {
            fontSize: "0.95rem",
            fontWeight: 500,
            color: error ? "#d32f2f" : "text.primary",
            "&.Mui-disabled": {
              color: alpha("#000", 0.38),
            },
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

Checkbox.displayName = "Checkbox";

export default Checkbox;
