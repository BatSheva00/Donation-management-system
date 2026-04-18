import { forwardRef, useState, useMemo, useRef } from "react";
import {
  alpha,
  TextField,
  Box,
  Menu,
  MenuItem,
  InputAdornment,
  IconButton,
  ListSubheader,
  Typography,
} from "@mui/material";
import { Controller, Control } from "react-hook-form";
import { KeyboardArrowDown, Search } from "@mui/icons-material";

export interface PhoneInputProps {
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  control: Control<any>;
  name: string;
  disabled?: boolean;
  placeholder?: string;
}

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { name: "Afghanistan", code: "AF", dialCode: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "AL", dialCode: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "DZ", dialCode: "+213", flag: "🇩🇿" },
  { name: "Andorra", code: "AD", dialCode: "+376", flag: "🇦🇩" },
  { name: "Angola", code: "AO", dialCode: "+244", flag: "🇦🇴" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷" },
  { name: "Armenia", code: "AM", dialCode: "+374", flag: "🇦🇲" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹" },
  { name: "Azerbaijan", code: "AZ", dialCode: "+994", flag: "🇦🇿" },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩" },
  { name: "Belarus", code: "BY", dialCode: "+375", flag: "🇧🇾" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪" },
  { name: "Bolivia", code: "BO", dialCode: "+591", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", code: "BA", dialCode: "+387", flag: "🇧🇦" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
  { name: "Bulgaria", code: "BG", dialCode: "+359", flag: "🇧🇬" },
  { name: "Cambodia", code: "KH", dialCode: "+855", flag: "🇰🇭" },
  { name: "Cameroon", code: "CM", dialCode: "+237", flag: "🇨🇲" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴" },
  { name: "Costa Rica", code: "CR", dialCode: "+506", flag: "🇨🇷" },
  { name: "Croatia", code: "HR", dialCode: "+385", flag: "🇭🇷" },
  { name: "Cuba", code: "CU", dialCode: "+53", flag: "🇨🇺" },
  { name: "Cyprus", code: "CY", dialCode: "+357", flag: "🇨🇾" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "🇨🇿" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰" },
  { name: "Dominican Republic", code: "DO", dialCode: "+1", flag: "🇩🇴" },
  { name: "Ecuador", code: "EC", dialCode: "+593", flag: "🇪🇨" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬" },
  { name: "El Salvador", code: "SV", dialCode: "+503", flag: "🇸🇻" },
  { name: "Estonia", code: "EE", dialCode: "+372", flag: "🇪🇪" },
  { name: "Ethiopia", code: "ET", dialCode: "+251", flag: "🇪🇹" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Georgia", code: "GE", dialCode: "+995", flag: "🇬🇪" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷" },
  { name: "Guatemala", code: "GT", dialCode: "+502", flag: "🇬🇹" },
  { name: "Honduras", code: "HN", dialCode: "+504", flag: "🇭🇳" },
  { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "🇭🇰" },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "🇭🇺" },
  { name: "Iceland", code: "IS", dialCode: "+354", flag: "🇮🇸" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩" },
  { name: "Iran", code: "IR", dialCode: "+98", flag: "🇮🇷" },
  { name: "Iraq", code: "IQ", dialCode: "+964", flag: "🇮🇶" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪" },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { name: "Jamaica", code: "JM", dialCode: "+1", flag: "🇯🇲" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { name: "Jordan", code: "JO", dialCode: "+962", flag: "🇯🇴" },
  { name: "Kazakhstan", code: "KZ", dialCode: "+7", flag: "🇰🇿" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼" },
  { name: "Latvia", code: "LV", dialCode: "+371", flag: "🇱🇻" },
  { name: "Lebanon", code: "LB", dialCode: "+961", flag: "🇱🇧" },
  { name: "Libya", code: "LY", dialCode: "+218", flag: "🇱🇾" },
  { name: "Lithuania", code: "LT", dialCode: "+370", flag: "🇱🇹" },
  { name: "Luxembourg", code: "LU", dialCode: "+352", flag: "🇱🇺" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾" },
  { name: "Malta", code: "MT", dialCode: "+356", flag: "🇲🇹" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽" },
  { name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦" },
  { name: "Nepal", code: "NP", dialCode: "+977", flag: "🇳🇵" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿" },
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴" },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰" },
  { name: "Palestine", code: "PS", dialCode: "+970", flag: "🇵🇸" },
  { name: "Panama", code: "PA", dialCode: "+507", flag: "🇵🇦" },
  { name: "Paraguay", code: "PY", dialCode: "+595", flag: "🇵🇾" },
  { name: "Peru", code: "PE", dialCode: "+51", flag: "🇵🇪" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦" },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
  { name: "Serbia", code: "RS", dialCode: "+381", flag: "🇷🇸" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  { name: "Slovakia", code: "SK", dialCode: "+421", flag: "🇸🇰" },
  { name: "Slovenia", code: "SI", dialCode: "+386", flag: "🇸🇮" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭" },
  { name: "Syria", code: "SY", dialCode: "+963", flag: "🇸🇾" },
  { name: "Taiwan", code: "TW", dialCode: "+886", flag: "🇹🇼" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭" },
  { name: "Tunisia", code: "TN", dialCode: "+216", flag: "🇹🇳" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷" },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "Uruguay", code: "UY", dialCode: "+598", flag: "🇺🇾" },
  { name: "Venezuela", code: "VE", dialCode: "+58", flag: "🇻🇪" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳" },
  { name: "Yemen", code: "YE", dialCode: "+967", flag: "🇾🇪" },
];

/**
 * Enhanced phone input component with integrated country selector
 */
const PhoneInput = forwardRef<HTMLDivElement, PhoneInputProps>((props, ref) => {
  const {
    label = "Phone Number",
    required = false,
    error = false,
    helperText,
    control,
    name,
    disabled = false,
    placeholder = "50-123-4567",
  } = props;

  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find((c) => c.code === "IL") || countries[0]
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSearchQuery("");
  };

  // Handle menu entering animation complete
  const handleMenuEntered = () => {
    // Focus immediately after transition completes
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const handleSelectCountry = (
    country: Country,
    onChange: (value: string) => void
  ) => {
    setSelectedCountry(country);
    // Update the phone number with the new country code
    if (displayValue) {
      onChange(`${country.dialCode}-${displayValue}`);
    } else {
      onChange("");
    }
    handleCloseMenu();
  };

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    const query = searchQuery.toLowerCase();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.dialCode.includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field, fieldState }) => (
        <>
          <TextField
            ref={ref}
            fullWidth
            label={label}
            required={required}
            disabled={disabled}
            error={error || !!fieldState.error}
            helperText={helperText || fieldState.error?.message}
            placeholder={placeholder}
            type="tel"
            value={displayValue}
            onChange={(e) => {
              // Only allow numbers, spaces, and dashes
              const newDisplayValue = e.target.value.replace(/[^\d\s-]/g, "");
              setDisplayValue(newDisplayValue);

              // Store the full value with dial code in the form
              const fullValue = newDisplayValue
                ? `${selectedCountry.dialCode}-${newDisplayValue}`
                : "";
              field.onChange(fullValue);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    onClick={handleOpenMenu}
                    disabled={disabled}
                    size="small"
                    sx={{
                      ml: -0.5,
                      "&:hover": {
                        backgroundColor: alpha("#359364", 0.08),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 20,
                          borderRadius: 0.5,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "divider",
                          backgroundImage: `url(https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png)`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "text.primary",
                        }}
                      >
                        {selectedCountry.dialCode}
                      </Typography>
                      <KeyboardArrowDown
                        sx={{ fontSize: "1rem", color: "text.secondary" }}
                      />
                    </Box>
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              // Force LTR for phone numbers - they should always read left-to-right
              direction: "ltr",
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
                // Keep label RTL-aware for proper positioning
                left: "unset",
                right: "unset",
                transformOrigin: "top left",
                "&.Mui-focused": {
                  color: "#359364",
                  fontWeight: 600,
                },
              },
              "& .MuiInputBase-input": {
                py: 1.75,
                fontSize: "16px",
                textAlign: "left",
              },
              "& .MuiFormHelperText-root": {
                textAlign: "left",
              },
            }}
          />

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            disableScrollLock
            disablePortal={false}
            disableAutoFocusItem
            autoFocus={false}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            TransitionProps={{
              onEntered: handleMenuEntered,
            }}
            slotProps={{
              paper: {
                sx: {
                  maxHeight: 400,
                  minWidth: 350,
                  mt: 1,
                  position: "fixed",
                },
              },
            }}
          >
            <ListSubheader
              sx={{
                bgcolor: "background.paper",
                position: "sticky",
                top: 0,
                zIndex: 2,
                py: 1,
              }}
            >
              <TextField
                inputRef={searchInputRef}
                size="small"
                autoFocus
                placeholder="Search countries..."
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  // Close menu on Escape
                  if (e.key === "Escape") {
                    handleCloseMenu();
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: "1.25rem" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "background.paper",
                  },
                }}
              />
            </ListSubheader>

            {filteredCountries.length === 0 ? (
              <MenuItem disabled>
                <Typography color="text.secondary">
                  No countries found
                </Typography>
              </MenuItem>
            ) : (
              filteredCountries.map((country) => (
                <MenuItem
                  key={country.code}
                  onClick={() => handleSelectCountry(country, field.onChange)}
                  selected={country.code === selectedCountry.code}
                  sx={{
                    py: 1.25,
                    px: 2,
                    "&.Mui-selected": {
                      backgroundColor: alpha("#359364", 0.08),
                      "&:hover": {
                        backgroundColor: alpha("#359364", 0.12),
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 26,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundImage: `url(https://flagcdn.com/w40/${country.code.toLowerCase()}.png)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {country.name}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ minWidth: 50, textAlign: "right" }}
                    >
                      {country.dialCode}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>
        </>
      )}
    />
  );
});

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
