import { useState } from "react";
import { Box, Paper, Typography, alpha, Button, Collapse } from "@mui/material";
import { Favorite, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { StarRating, RatingList } from "../../ratings";
import { useUserRatings } from "../../ratings/hooks/useRatings";
import { RatingType } from "../../ratings/types/rating.types";

interface DonorRatingSectionProps {
  userId: string;
  donorRating: number;
  donorRatingCount: number;
}

export const DonorRatingSection = ({
  userId,
  donorRating,
  donorRatingCount,
}: DonorRatingSectionProps) => {
  const { t } = useTranslation();
  const [showReviews, setShowReviews] = useState(false);

  const { data: ratingsData, isLoading } = useUserRatings(
    showReviews ? userId : undefined,
    { type: RatingType.DONOR_RATING }
  );

  // Only show if there's a rating
  if (!donorRating || donorRating === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Favorite color="primary" />
        <Typography variant="h6" fontWeight={700}>
          {t("profile.donorRating") || "Donor Rating"}
        </Typography>
      </Box>

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
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: alpha("#f59e0b", 0.15),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5" fontWeight={700} color="#f59e0b">
            {donorRating.toFixed(1)}
          </Typography>
        </Box>
        <Box>
          <StarRating
            value={donorRating}
            count={donorRatingCount}
            size="medium"
            showValue={false}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("profile.basedOnRatings", { count: donorRatingCount }) ||
              `Based on ${donorRatingCount} rating${donorRatingCount !== 1 ? "s" : ""}`}
          </Typography>
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
        {t("profile.donorRatingDescription") ||
          "This rating reflects feedback from drivers about donation quality and accuracy."}
      </Typography>

      {donorRatingCount > 0 && (
        <>
          <Button
            onClick={() => setShowReviews(!showReviews)}
            endIcon={showReviews ? <ExpandLess /> : <ExpandMore />}
            sx={{ mt: 2 }}
            size="small"
          >
            {showReviews
              ? t("ratings.hideReviews") || "Hide Reviews"
              : t("ratings.viewAllReviews") || `View All Reviews (${donorRatingCount})`}
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
    </Paper>
  );
};

export default DonorRatingSection;
