import { forwardRef } from "react";
import {
  Radio as MuiRadio,
  RadioProps as MuiRadioProps,
  RadioGroup,
  RadioGroupProps,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormHelperText,
  alpha,
} from "@mui/material";

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface RadioProps extends Omit<RadioGroupProps, "color"> {
  label?: string;
  options: RadioOption[];
  helperText?: string;
  error?: boolean;
  required?: boolean;
  color?: MuiRadioProps["color"];
}

/**
 * Styled Radio component with consistent design
 * Supports all standard RadioGroup props and integrates with react-hook-form
 */
const Radio = forwardRef<HTMLDivElement, RadioProps>((props, ref) => {
  const {
    label,
    options,
    helperText,
    error,
    required,
    color = "primary",
    row,
    ...rest
  } = props;

  return (
    <FormControl component="fieldset" error={error} fullWidth>
      {label && (
        <FormLabel
          component="legend"
          required={required}
          sx={{
            mb: 1.5,
            fontSize: "0.95rem",
            fontWeight: 600,
            color: error ? "#d32f2f" : "text.primary",
            "&.Mui-focused": {
              color: error ? "#d32f2f" : "#359364",
            },
          }}
        >
          {label}
        </FormLabel>
      )}
      <RadioGroup ref={ref} row={row} {...rest}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            control={
              <MuiRadio
                color={color}
                sx={{
                  "&:hover": {
                    bgcolor: alpha("#359364", 0.08),
                  },
                  "&.Mui-checked": {
                    color: "#359364",
                  },
                }}
              />
            }
            label={option.label}
            sx={{
              mb: row ? 0 : 1,
              mr: row ? 3 : 0,
              "& .MuiFormControlLabel-label": {
                fontSize: "0.95rem",
                fontWeight: 500,
              },
            }}
          />
        ))}
      </RadioGroup>
      {helperText && (
        <FormHelperText
          sx={{
            ml: 0,
            mt: 0.5,
            fontSize: "0.875rem",
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
});

Radio.displayName = "Radio";

export default Radio;
