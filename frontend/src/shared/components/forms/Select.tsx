import { forwardRef } from "react";
import { TextField, TextFieldProps, MenuItem, alpha } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<TextFieldProps, "select" | "variant"> {
  options: SelectOption[];
  placeholder?: string;
  variant?: "outlined" | "filled" | "standard";
  emptyOption?: boolean;
  emptyOptionLabel?: string;
}

/**
 * Styled Select component with consistent design
 * Supports all standard TextField props and integrates with react-hook-form
 */
const Select = forwardRef<HTMLDivElement, SelectProps>((props, ref) => {
  const {
    options,
    placeholder,
    variant = "outlined",
    emptyOption = true,
    emptyOptionLabel = "Select an option",
    children,
    ...rest
  } = props;

  const { i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  return (
    <TextField
      ref={ref}
      select
      variant={variant}
      {...rest}
      inputProps={{
        ...rest.inputProps,
        required: false, // Disable browser validation
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
        "& .MuiSelect-select": {
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
        // RTL fix for select icon
        "& .MuiSelect-icon": {
          right: isRTL ? "unset" : "7px",
          left: isRTL ? "7px" : "unset",
        },
        ...rest.sx,
      }}
      SelectProps={{
        displayEmpty: !!placeholder,
        ...rest.SelectProps,
        MenuProps: {
          PaperProps: {
            sx: {
              borderRadius: 2,
              mt: 1,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              "& .MuiMenuItem-root": {
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                "&:hover": {
                  bgcolor: alpha("#359364", 0.08),
                },
                "&.Mui-selected": {
                  bgcolor: alpha("#359364", 0.12),
                  "&:hover": {
                    bgcolor: alpha("#359364", 0.16),
                  },
                },
              },
            },
          },
          ...rest.SelectProps?.MenuProps,
        },
      }}
    >
      {emptyOption && (
        <MenuItem value="" disabled={!placeholder}>
          <em>{placeholder || emptyOptionLabel}</em>
        </MenuItem>
      )}
      {children ||
        options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
    </TextField>
  );
});

Select.displayName = "Select";

export default Select;
