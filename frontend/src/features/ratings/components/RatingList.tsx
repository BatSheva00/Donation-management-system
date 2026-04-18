import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Skeleton,
  alpha,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Rating, RatingType } from "../types/rating.types";
import { StarRating } from "./StarRating";
import UserAvatar from "../../../shared/components/shared/UserAvatar";

interface RatingListProps {
  ratings: Rating[];
  loading?: boolean;
  emptyMessage?: string;
  showDonationTitle?: boolean;
}

export const RatingList = ({
  ratings,
  loading = false,
  emptyMessage,
  showDonationTitle = true,
}: RatingListProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Paper key={i} sx={{ p: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="40%" height={20} />
                <Skeleton width="60%" height={16} sx={{ mt: 1 }} />
                <Skeleton width="100%" height={16} sx={{ mt: 1 }} />
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>
    );
  }

  if (ratings.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: alpha("#000", 0.02),
        }}
      >
        <Typography color="text.secondary">
          {emptyMessage || t("ratings.noRatings") || "No ratings yet"}
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {ratings.map((rating, index) => {
        const raterInitials = `${rating.raterId?.firstName?.[0] || ""}${rating.raterId?.lastName?.[0] || ""}`.toUpperCase();

        return (
          <Paper key={rating._id} sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <UserAvatar
                src={rating.raterId?.profileImage}
                initials={raterInitials}
                size={44}
                showBadge={false}
              />
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight={600}>
                    {rating.raterId?.firstName} {rating.raterId?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <StarRating
                  value={rating.value}
                  size="small"
                  showCount={false}
                  sx={{ mt: 0.5 }}
                />

                {rating.comment && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1.5 }}
                  >
                    {rating.comment}
                  </Typography>
                )}

                {showDonationTitle && rating.donationId?.title && (
                  <Box
                    sx={{
                      mt: 1.5,
                      pt: 1.5,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {rating.type === RatingType.DRIVER_RATING
                        ? t("ratings.forDelivery") || "For delivery:"
                        : t("ratings.forDonation") || "For donation:"}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {rating.donationId.title}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default RatingList;
