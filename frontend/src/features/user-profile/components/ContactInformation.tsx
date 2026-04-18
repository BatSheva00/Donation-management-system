import { Box, Paper, Typography, Grid, TextField } from "@mui/material";
import { Person, Email, Phone } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface ContactInformationProps {
  formData: any;
  userData: any;
  isEditing: boolean;
  onFieldChange: (field: string, value: any) => void;
  onNestedFieldChange: (parent: string, field: string, value: any) => void;
}

export const ContactInformation = ({
  formData,
  userData,
  isEditing,
  onFieldChange,
  onNestedFieldChange,
}: ContactInformationProps) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <Person color="primary" />
        <Typography variant="h6" fontWeight={700}>
          {t("profile.contactInfo")}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t("profile.firstName")}
            value={formData.firstName}
            onChange={(e) => onFieldChange("firstName", e.target.value)}
            disabled={!isEditing}
            InputProps={{
              startAdornment: (
                <Person sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t("profile.lastName")}
            value={formData.lastName}
            onChange={(e) => onFieldChange("lastName", e.target.value)}
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("profile.email")}
            value={userData.email}
            disabled
            InputProps={{
              startAdornment: <Email sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={t("profile.countryCode")}
            value={formData.phone.countryCode}
            onChange={(e) =>
              onNestedFieldChange("phone", "countryCode", e.target.value)
            }
            disabled={!isEditing}
            InputProps={{
              startAdornment: <Phone sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label={t("profile.phoneNumber")}
            value={formData.phone.number}
            onChange={(e) =>
              onNestedFieldChange("phone", "number", e.target.value)
            }
            disabled={!isEditing}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
