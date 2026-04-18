import { Box, Paper, Typography, Grid, TextField } from "@mui/material";
import { Business } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface BusinessInfoSectionProps {
  formData: any;
  isEditing: boolean;
  onNestedFieldChange: (parent: string, field: string, value: any) => void;
}

export const BusinessInfoSection = ({
  formData,
  isEditing,
  onNestedFieldChange,
}: BusinessInfoSectionProps) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <Business color="primary" />
        <Typography variant="h6" fontWeight={700}>
          {t("profile.businessInfo")}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t("profile.businessName")}
            value={formData.businessInfo.businessName}
            onChange={(e) =>
              onNestedFieldChange("businessInfo", "businessName", e.target.value)
            }
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t("profile.businessType")}
            value={formData.businessInfo.businessType}
            onChange={(e) =>
              onNestedFieldChange("businessInfo", "businessType", e.target.value)
            }
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("profile.registrationNumber")}
            value={formData.businessInfo.registrationNumber}
            onChange={(e) =>
              onNestedFieldChange(
                "businessInfo",
                "registrationNumber",
                e.target.value
              )
            }
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t("profile.description")}
            value={formData.businessInfo.description}
            onChange={(e) =>
              onNestedFieldChange("businessInfo", "description", e.target.value)
            }
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("profile.website")}
            value={formData.businessInfo.website}
            onChange={(e) =>
              onNestedFieldChange("businessInfo", "website", e.target.value)
            }
            disabled={!isEditing}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

