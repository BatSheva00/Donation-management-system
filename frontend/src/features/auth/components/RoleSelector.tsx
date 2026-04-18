import { Box, Typography, ToggleButtonGroup, ToggleButton, alpha } from "@mui/material";
import { Person, Business, LocalShipping } from "@mui/icons-material";
import { Control, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface RoleSelectorProps {
  control: Control<any>;
  name: string;
}

export const RoleSelector = ({ control, name }: RoleSelectorProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
        {t("auth.iAmA")}
      </Typography>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <ToggleButtonGroup
            {...field}
            exclusive
            onChange={(e, value) => {
              if (value !== null) field.onChange(value);
            }}
            fullWidth
            sx={{
              flexDirection: "row",
              "& .MuiToggleButton-root": {
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                border: "1px solid",
                borderColor: "divider",
                // Fix RTL border styling - first and last child selectors
                "&:first-of-type": {
                  borderTopLeftRadius: isRTL ? 0 : undefined,
                  borderBottomLeftRadius: isRTL ? 0 : undefined,
                  borderTopRightRadius: isRTL ? "4px" : undefined,
                  borderBottomRightRadius: isRTL ? "4px" : undefined,
                },
                "&:last-of-type": {
                  borderTopRightRadius: isRTL ? 0 : undefined,
                  borderBottomRightRadius: isRTL ? 0 : undefined,
                  borderTopLeftRadius: isRTL ? "4px" : undefined,
                  borderBottomLeftRadius: isRTL ? "4px" : undefined,
                },
                "&.Mui-selected": {
                  bgcolor: alpha("#359364", 0.08),
                  color: "primary.main",
                  borderColor: "primary.main",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: alpha("#359364", 0.12),
                  },
                },
              },
            }}
          >
            <ToggleButton value="user">
              <Person sx={{ me: 1 }} /> {t("roles.user")}
            </ToggleButton>
            <ToggleButton value="business">
              <Business sx={{ me: 1 }} /> {t("roles.business")}
            </ToggleButton>
            <ToggleButton value="driver">
              <LocalShipping sx={{ me: 1 }} /> {t("roles.driver")}
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      />
    </Box>
  );
};

