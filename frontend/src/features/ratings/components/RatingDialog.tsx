import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  CircularProgress,
  TextField,
  alpha,
} from "@mui/material";
import { Star } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import UserAvatar from "../../../shared/components/shared/UserAvatar";
import { StarRating } from "./StarRating";
import { RatingType } from "../types/rating.types";

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => void;
  loading?: boolean;
  type: RatingType;
  userToRate: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  donationTitle: string;
}

export const RatingDialog = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  type,
  userToRate,
  donationTitle,
}: RatingDialogProps) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit(rating, comment.trim() || undefined);
  };

  const handleClose = () => {
    if (!loading) {
      setRating(0);
      setComment("");
      onClose();
    }
  };

  const isDriver = type === RatingType.DRIVER_RATING;
  const title = isDriver
    ? t("ratings.rateDriver") || "Rate Your Driver"
    : t("ratings.rateDonor") || "Rate the Donation";
  const subtitle = isDriver
    ? t("ratings.rateDriverDesc") || "How was your delivery experience?"
    : t("ratings.rateDonorDesc") || "How was the donation quality?";

  const userInitials = `${userToRate.firstName?.[0] || ""}${userToRate.lastName?.[0] || ""}`.toUpperCase();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: alpha("#f59e0b", 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Star sx={{ color: "#f59e0b", fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* User being rated */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              bgcolor: alpha("#000", 0.02),
              borderRadius: 2,
            }}
          >
            <UserAvatar
              src={userToRate.profileImage}
              initials={userInitials}
              size={56}
              showBadge={false}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" fontWeight={600}>
                {userToRate.firstName} {userToRate.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isDriver
                  ? t("ratings.deliveryDriver") || "Delivery Driver"
                  : t("ratings.donor") || "Donor"}
              </Typography>
            </Box>
          </Box>

          {/* Donation reference */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t("ratings.forDonation") || "For donation:"}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {donationTitle}
            </Typography>
          </Box>

          {/* Star rating selector */}
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t("ratings.selectRating") || "Select your rating"}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 1,
              }}
            >
              <StarRating
                value={rating}
                size="large"
                readOnly={false}
                showValue={false}
                showCount={false}
                onChange={setRating}
              />
            </Box>
            {rating > 0 && (
              <Typography
                variant="body2"
                color="primary"
                fontWeight={600}
                sx={{ mt: 1 }}
              >
                {rating === 1 && (t("ratings.poor") || "Poor")}
                {rating === 2 && (t("ratings.fair") || "Fair")}
                {rating === 3 && (t("ratings.good") || "Good")}
                {rating === 4 && (t("ratings.veryGood") || "Very Good")}
                {rating === 5 && (t("ratings.excellent") || "Excellent")}
              </Typography>
            )}
          </Box>

          {/* Comment field */}
          <TextField
            label={t("ratings.comment") || "Comment (optional)"}
            placeholder={
              isDriver
                ? t("ratings.driverCommentPlaceholder") ||
                  "Share your experience with the delivery..."
                : t("ratings.donorCommentPlaceholder") ||
                  "Share your feedback about the donation quality..."
            }
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${comment.length}/500`}
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          color="inherit"
          sx={{ minWidth: 100 }}
        >
          {t("common.cancel") || "Cancel"}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={rating === 0 || loading}
          sx={{ minWidth: 140 }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            t("ratings.submitRating") || "Submit Rating"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingDialog;
