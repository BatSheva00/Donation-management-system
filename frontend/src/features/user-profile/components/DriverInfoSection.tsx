import { useState } from "react";
import { Box, Paper, Typography, Grid, TextField, alpha, Button, Collapse } from "@mui/material";
import { LocalShipping, Star, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { StarRating, RatingList } from "../../ratings";
import { useUserRatings } from "../../ratings/hooks/useRatings";
import { RatingType } from "../../ratings/types/rating.types";

interface DriverInfoSectionProps {
  formData: any;
  userData: any; // For read-only fields like ratings
  userId: string;
  isEditing: boolean;
  onNestedFieldChange: (parent: string, field: string, value: any) => void;
}

export const DriverInfoSection = ({
  formData,
  userData,
  userId,
  isEditing,
  onNestedFieldChange,
}: DriverInfoSectionProps) => {
  const { t } = useTranslation();
  const [showReviews, setShowReviews] = useState(false);

  const ratingCount = userData?.driverInfo?.ratingCount || 0;

  const { data: ratingsData, isLoading } = useUserRatings(
    showReviews ? userId : undefined,
    { type: RatingType.DRIVER_RATING }
  );

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <LocalShipping color="primary" />
        <Typography variant="h6" fontWeight={700}>
          {t("profile.driverInfo")}
        </Typography>
      </Box>

      {/* Driver Rating Display */}
      {(userData?.driverInfo?.rating > 0 || ratingCount > 0) && (
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: alpha("#f59e0b", 0.08),
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: alpha("#f59e0b", 0.15),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Star sx={{ color: "#f59e0b", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t("profile.driverRating") || "Driver Rating"}
              </Typography>
              <StarRating
                value={userData?.driverInfo?.rating || 0}
                count={ratingCount}
                size="medium"
              />
            </Box>
          </Box>

          {ratingCount > 0 && (
            <>
              <Button
                onClick={() => setShowReviews(!showReviews)}
                endIcon={showReviews ? <ExpandLess /> : <ExpandMore />}
                sx={{ mt: 2 }}
                size="small"
              >
                {showReviews
                  ? t("ratings.hideReviews") || "Hide Reviews"
                  : t("ratings.viewAllReviews") || `View All Reviews (${ratingCount})`}
              </Button>

              <Collapse in={showReviews}>
                <Box sx={{ mt: 2 }}>
                  <RatingList
                    ratings={ratingsData?.data || []}
                    loading={isLoading}
                    emptyMessage={t("ratings.noReviews") || "No reviews yet"}
                  />
                </Box>
              </Collapse>
            </>
          )}
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t("profile.licenseNumber")}
            value={formData.driverInfo.licenseNumber}
            onChange={(e) =>
              onNestedFieldChange("driverInfo", "licenseNumber", e.target.value)
            }
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t("profile.licenseExpiry")}
            value={formData.driverInfo.licenseExpiry}
            onChange={(e) =>
              onNestedFieldChange("driverInfo", "licenseExpiry", e.target.value)
            }
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t("profile.vehicleType")}
            value={formData.driverInfo.vehicleType}
            onChange={(e) =>
              onNestedFieldChange("driverInfo", "vehicleType", e.target.value)
            }
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t("profile.vehicleModel")}
            value={formData.driverInfo.vehicleModel}
            onChange={(e) =>
              onNestedFieldChange("driverInfo", "vehicleModel", e.target.value)
            }
            disabled={!isEditing}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
