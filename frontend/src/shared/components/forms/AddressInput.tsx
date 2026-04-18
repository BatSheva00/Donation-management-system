import { forwardRef, useState } from "react";
import { alpha, TextField, Box } from "@mui/material";
import { Controller, Control } from "react-hook-form";
import { AddressAutofill } from "@mapbox/search-js-react";

export interface AddressInputProps {
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  control: Control<any>;
  name: string;
  disabled?: boolean;
  placeholder?: string;
  accessToken: string;
}

export interface AddressValue {
  fullAddress: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Address input with Mapbox autocomplete
 * Returns structured address data
 */
const AddressInput = forwardRef<HTMLDivElement, AddressInputProps>(
  (props, ref) => {
    const {
      label = "Address",
      required = false,
      error = false,
      helperText,
      control,
      name,
      disabled = false,
      placeholder = "Start typing your address...",
      accessToken,
    } = props;

    const [showAutocomplete] = useState(true);

    return (
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field: { onChange, value }, fieldState }) => (
          <Box ref={ref} sx={{ position: "relative", width: "100%" }}>
            {showAutocomplete ? (
              <AddressAutofill accessToken={accessToken}>
                <TextField
                  fullWidth
                  label={label}
                  required={required}
                  disabled={disabled}
                  error={error || !!fieldState.error}
                  helperText={helperText || fieldState.error?.message}
                  placeholder={placeholder}
                  value={
                    typeof value === "string" ? value : value?.fullAddress || ""
                  }
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    onChange(inputValue);
                  }}
                  autoComplete="address-line1"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: alpha("#000", 0.12),
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
                    },
                    "& .MuiInputBase-input": {
                      py: 1.75,
                      fontSize: "16px",
                    },
                  }}
                />
              </AddressAutofill>
            ) : (
              <TextField
                fullWidth
                label={label}
                required={required}
                disabled={disabled}
                error={error || !!fieldState.error}
                helperText={helperText || fieldState.error?.message}
                placeholder={placeholder}
                value={
                  typeof value === "string" ? value : value?.fullAddress || ""
                }
                onChange={(e) => onChange(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: alpha("#000", 0.12),
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
                  },
                  "& .MuiInputBase-input": {
                    py: 1.75,
                    fontSize: "16px",
                  },
                }}
              />
            )}
          </Box>
        )}
      />
    );
  }
);

AddressInput.displayName = "AddressInput";

export default AddressInput;
