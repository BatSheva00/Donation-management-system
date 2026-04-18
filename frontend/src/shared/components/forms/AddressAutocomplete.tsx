import { useState, useEffect, useCallback } from "react";
import { Autocomplete, TextField, CircularProgress, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  searchCities,
  searchStreets,
} from "../../../shared/services/addressService";

interface AddressAutocompleteProps {
  type: "city" | "street";
  value: string;
  onChange: (value: string) => void;
  onInputChange?: (value: string) => void; // Callback for input value changes
  label: string;
  error?: boolean;
  helperText?: string;
  cityContext?: string; // For street search, provide the city
  disabled?: boolean;
  required?: boolean;
}

const AddressAutocomplete = ({
  type,
  value,
  onChange,
  onInputChange,
  label,
  error,
  helperText,
  cityContext,
  disabled,
  required,
}: AddressAutocompleteProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const [inputValue, setInputValue] = useState(value || "");
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);

  // Fetch options with debouncing
  const fetchOptions = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setOptions([]);
        return;
      }

      // For street search, skip if input contains only numbers (user is typing house number)
      if (type === "street") {
        const onlyNumbers = /^[\d\s]+$/.test(searchQuery.trim());
        if (onlyNumbers) {
          setOptions([]);
          return;
        }
      }

      setLoading(true);
      try {
        let results: string[] = [];
        if (type === "city") {
          results = await searchCities(searchQuery);
        } else if (type === "street") {
          results = await searchStreets(searchQuery, cityContext);
        }
        setOptions(results);
      } catch (error) {
        console.error("Autocomplete fetch error:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [type, cityContext]
  );

  // Debounced search
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Don't search if input is too short
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }

    // Set new timer (500ms debounce)
    const timer = setTimeout(() => {
      fetchOptions(inputValue);
    }, 500);

    setDebounceTimer(timer);

    // Cleanup
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [inputValue, fetchOptions]);

  // Helper function to highlight matching text (works with RTL)
  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) {
      return text;
    }

    // Split text into parts for highlighting
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);

    return (
      <span style={{ direction: "inherit" }}>
        {before}
        <Box
          component="span"
          sx={{
            textDecoration: "underline",
            textDecorationColor: "primary.main",
            textDecorationThickness: "2px",
            fontWeight: 600,
            color: "primary.main",
          }}
        >
          {match}
        </Box>
        {after}
      </span>
    );
  };

  return (
    <Autocomplete
      freeSolo // Allow custom values (not just from the list)
      disableClearable // Remove the X clear button
      options={options}
      value={value}
      inputValue={inputValue}
      onInputChange={(_, newInputValue, reason) => {
        setInputValue(newInputValue);
        onInputChange?.(newInputValue); // Notify parent of input changes
        // For freeSolo, update the form value as user types
        if (reason === "input") {
          onChange(newInputValue);
        }
      }}
      onChange={(_, newValue) => {
        onChange(newValue || "");
      }}
      onBlur={() => {
        // Ensure the typed value is saved on blur
        if (inputValue !== value) {
          onChange(inputValue);
        }
      }}
      loading={loading}
      disabled={disabled}
      isOptionEqualToValue={(option, value) => option === value}
      noOptionsText={
        inputValue.length < 2
          ? isRTL
            ? "הקלד לפחות 2 תווים"
            : "Type at least 2 characters"
          : loading
          ? isRTL
            ? "מחפש..."
            : "Searching..."
          : isRTL
          ? "לא נמצאו תוצאות"
          : "No results found"
      }
      renderOption={(props, option) => (
        <li {...props} key={option}>
          {highlightMatch(option, inputValue)}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={required ? `${label} *` : label}
          error={error}
          helperText={helperText}
          inputProps={{
            ...params.inputProps,
            required: false, // Disable browser validation, we use zod
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              transition: "all 0.2s",
              "& fieldset": {
                borderColor: (theme) =>
                  theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.12)"
                    : "rgba(255, 255, 255, 0.12)",
                transition: "border-color 0.2s",
              },
              "&:hover fieldset": {
                borderColor: (theme) =>
                  theme.palette.mode === "light"
                    ? "rgba(53, 147, 100, 0.3)"
                    : "rgba(53, 147, 100, 0.5)",
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
          }}
        />
      )}
      sx={{
        // Popup indicator stays at correct position
        "& .MuiAutocomplete-popupIndicator": {
          marginInlineEnd: 0,
        },
      }}
    />
  );
};

export default AddressAutocomplete;
