import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Avatar,
  Divider,
  Stack,
  CircularProgress,
  alpha,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  ArrowBack,
  LocationOn,
  CalendarToday,
  Inventory,
  Phone,
  Email,
  Restaurant,
  AttachMoney,
  Scale,
  Notes,
  Translate as TranslateIcon,
  Undo,
  VolumeUp,
  LocalShipping,
  Visibility,
  Warning,
  Star,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import api from "../../lib/axios";
import { Donation, DonationStatus } from "./types/donation.types";
import { getProfileImageUrl, getUserInitials, isUserVerified } from "../../utils/userUtils";
import { useAuthStore } from "../../shared/stores/authStore";
import { DeliveryRequestDialog } from "./components/DeliveryRequestDialog";
import { DriverStatusButton } from "./components/DriverStatusButton";
import { CompleteButton } from "./components/CompleteButton";
import UserAvatar from "../../shared/components/shared/UserAvatar";
import { DonationStatusTimeline } from "./components/DonationStatusTimeline";
import { RatingDialog, StarRating } from "../ratings";
import { useCanRate, useCreateRating } from "../ratings/hooks/useRatings";
import { RatingType } from "../ratings/types/rating.types";

const DonationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, hasPermission } = useAuthStore();
  const queryClient = useQueryClient();
  const [translatedDescription, setTranslatedDescription] = useState<
    string | null
  >(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [audioCache, setAudioCache] = useState<{
    url: string | null;
    text: string | null;
  }>({ url: null, text: null });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showUnassignRequestDialog, setShowUnassignRequestDialog] = useState(false);
  const [showUnassignDriverDialog, setShowUnassignDriverDialog] = useState(false);
  const [showDriverRatingDialog, setShowDriverRatingDialog] = useState(false);
  const [showDonorRatingDialog, setShowDonorRatingDialog] = useState(false);

  const { data, isLoading, error } = useQuery<{
    success: boolean;
    data: Donation;
  }>({
    queryKey: ["donation", id],
    queryFn: async () => {
      const response = await api.get(`/donations/${id}`);
      return response.data;
    },
    enabled: !!id,
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnMount: "always", // Always refetch when component mounts
    staleTime: 0, // Data is immediately considered stale
  });

  const donation = data?.data;

  // Rating queries and mutations
  const { data: canRateData } = useCanRate(
    donation?.status === DonationStatus.COMPLETED ? id : undefined
  );
  const createRatingMutation = useCreateRating();

  const handleSubmitRating = (type: RatingType, value: number, comment?: string) => {
    if (!id) return;
    createRatingMutation.mutate(
      { donationId: id, type, value, comment },
      {
        onSuccess: () => {
          if (type === RatingType.DRIVER_RATING) {
            setShowDriverRatingDialog(false);
          } else {
            setShowDonorRatingDialog(false);
          }
          queryClient.invalidateQueries({ queryKey: ["ratings", "can-rate", id] });
        },
      }
    );
  };

  // Translation mutation
  const translateMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await api.post("/translate", { text });
      return response.data.data;
    },
    onSuccess: (data) => {
      setTranslatedDescription(data.translatedText);
      setTranslationError(null);
    },
    onError: (error: any) => {
      setTranslationError(
        error.response?.data?.message ||
          t("donations.translationFailed") ||
          "Translation failed"
      );
      setTranslatedDescription(null);
    },
  });

  const handleTranslate = () => {
    if (donation?.description) {
      setTranslationError(null);
      translateMutation.mutate(donation.description);
    }
  };

  const handleShowOriginal = () => {
    setTranslatedDescription(null);
    setTranslationError(null);
  };

  // Text-to-Speech mutation
  const ttsMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await api.post(
        "/tts",
        { text },
        {
          responseType: "blob", // Important: receive as blob
        }
      );
      return response.data;
    },
    onSuccess: (audioBlob, text) => {
      // Create URL from blob and cache it
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioCache({ url: audioUrl, text });

      // Play the audio
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        alert("Failed to play audio");
      };
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to generate speech");
    },
  });

  const handleListen = () => {
    const textToSpeak = translatedDescription || donation?.description;

    if (!textToSpeak) return;

    // Check if we have cached audio for this exact text
    if (audioCache.url && audioCache.text === textToSpeak) {
      // Play cached audio
      const audio = new Audio(audioCache.url);
      audio.play();
      setIsPlaying(true);

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        alert("Failed to play audio");
      };
    } else {
      // Generate new audio
      ttsMutation.mutate(textToSpeak);
    }
  };

  // Cleanup audio URL when component unmounts or when leaving the page
  useEffect(() => {
    return () => {
      if (audioCache.url) {
        URL.revokeObjectURL(audioCache.url);
      }
    };
  }, [audioCache.url]);

  // Request donation mutation
  const requestMutation = useMutation({
    mutationFn: async (deliveryInfo: {
      needsDelivery: boolean;
      deliveryAddress?: string;
      deliveryCity?: string;
    }) => {
      const response = await api.post(`/donations/${id}/request`, deliveryInfo);
      return response.data;
    },
    onSuccess: () => {
      setShowDeliveryDialog(false);
      // Refetch donation data smoothly without page reload
      queryClient.invalidateQueries({ queryKey: ["donation", id] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to request donation");
    },
  });

  // Approve request mutation (admin only)
  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/donations/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation", id] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to approve request");
    },
  });

  // Reject request mutation (admin only)
  const rejectMutation = useMutation({
    mutationFn: async (rejectionReason?: string) => {
      const response = await api.patch(`/donations/${id}/reject`, {
        rejectionReason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation", id] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to reject request");
    },
  });

  // Unassign request mutation (requester only)
  const unassignRequestMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/donations/${id}/unassign-request`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation", id] });
      alert("Successfully canceled your request");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to cancel request");
    },
  });

  // Unassign driver mutation (driver only)
  const unassignDriverMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/donations/${id}/unassign-driver`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation", id] });
      alert("Successfully unassigned from delivery");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to unassign from delivery");
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#f59e0b",
      approved: "#10b981",
      requested: "#3b82f6",
      assigned: "#3b82f6",
      in_transit: "#8b5cf6",
      delivered: "#10b981",
      completed: "#6b7280",
      cancelled: "#ef4444",
      rejected: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: "#10b981",
      clothing: "#8b5cf6",
      electronics: "#f59e0b",
      furniture: "#3b82f6",
      books: "#ec4899",
      toys: "#f97316",
      other: "#6b7280",
    };
    return colors[category] || "#6b7280";
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !donation) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            {t("donations.notFound") || "Donation not found"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            {t("common.back") || "Back"}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          {t("common.back") || "Back"}
        </Button>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="h4" fontWeight={800}>
              {donation.title}
            </Typography>
            <Chip
              label={donation.type}
              sx={{
                bgcolor: alpha(getCategoryColor(donation.type), 0.1),
                color: getCategoryColor(donation.type),
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            />
            <Chip
              label={donation.status.replace(/_/g, " ")}
              sx={{
                bgcolor: alpha(getStatusColor(donation.status), 0.1),
                color: getStatusColor(donation.status),
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            />
          </Box>

          {/* Request Button - Show only if donation is PENDING and user is NOT the donor */}
          {donation.status === DonationStatus.PENDING && 
           user?.id !== donation.donorId?._id && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowDeliveryDialog(true)}
              sx={{ minWidth: 120 }}
            >
              {t("donations.requestDonation") || "Request Donation"}
            </Button>
          )}

          {/* Driver Actions - Show if user is the assigned driver */}
          {user?.id && donation.assignedDriverId?._id && 
           donation.assignedDriverId._id === user.id && (
            <Stack direction="row" spacing={2}>
              {donation.status === DonationStatus.WAITING_FOR_DELIVERY && (
                <>
                  <DriverStatusButton
                    donationId={donation._id}
                    label={t("donations.markInTransit") || "Mark In Transit"}
                    endpoint="mark-in-transit"
                  />
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => setShowUnassignDriverDialog(true)}
                    disabled={unassignDriverMutation.isPending}
                  >
                    {unassignDriverMutation.isPending ? "Unassigning..." : t("donations.unassignDriver") || "Unassign"}
                  </Button>
                </>
              )}
              {donation.status === DonationStatus.IN_TRANSIT && (
                <DriverStatusButton
                  donationId={donation._id}
                  label={t("donations.markDelivered") || "Mark Delivered"}
                  endpoint="mark-delivered"
                />
              )}
            </Stack>
          )}

          {/* Requester Actions */}
          {user?.id && donation.requestedBy?._id &&
           donation.requestedBy._id === user.id && (
            <Stack direction="row" spacing={2}>
              {/* Complete button - Show when ready to complete */}
              {(
                (!donation.needsDelivery && donation.status === DonationStatus.APPROVED) ||
                (donation.needsDelivery && donation.status === DonationStatus.DELIVERED)
              ) && (
                <CompleteButton donationId={donation._id} />
              )}

              {/* Unassign button - Show only when requested (before approval) */}
              {donation.status === DonationStatus.REQUESTED && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => setShowUnassignRequestDialog(true)}
                  disabled={unassignRequestMutation.isPending}
                >
                  {unassignRequestMutation.isPending ? "Canceling..." : t("donations.cancelRequest") || "Cancel Request"}
                </Button>
              )}

              {/* Rate Driver button - Show when donation is completed and user can rate */}
              {donation.status === DonationStatus.COMPLETED &&
               canRateData?.data?.canRateDriver && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setShowDriverRatingDialog(true)}
                  startIcon={<Star />}
                >
                  {t("ratings.rateDriver") || "Rate Driver"}
                </Button>
              )}
            </Stack>
          )}

          {/* Driver Rating Action - For drivers to rate donors */}
          {user?.id && donation.assignedDriverId?._id &&
           donation.assignedDriverId._id === user.id &&
           donation.status === DonationStatus.COMPLETED &&
           canRateData?.data?.canRateDonor && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setShowDonorRatingDialog(true)}
              startIcon={<Star />}
            >
              {t("ratings.rateDonor") || "Rate Donation"}
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("donations.description") || "Description"}
            </Typography>

            {translationError && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setTranslationError(null)}
              >
                {translationError}
              </Alert>
            )}

            {/* Text - shows original or translated */}
            <Typography variant="body1" color="text.secondary" paragraph>
              {translatedDescription || donation.description}
            </Typography>

            {/* Enhanced Translate and Listen buttons */}
            <Box
              sx={{
                mt: 2.5,
                display: "flex",
                gap: 1.5,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {translatedDescription ? (
                <Button
                  startIcon={<Undo />}
                  onClick={handleShowOriginal}
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                    borderColor: alpha("#3b82f6", 0.3),
                    color: "#3b82f6",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "#3b82f6",
                      bgcolor: alpha("#3b82f6", 0.05),
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
                    },
                  }}
                >
                  {t("donations.showOriginal")}
                </Button>
              ) : (
                <Button
                  startIcon={
                    translateMutation.isPending ? (
                      <CircularProgress size={16} />
                    ) : (
                      <TranslateIcon />
                    )
                  }
                  onClick={handleTranslate}
                  disabled={translateMutation.isPending}
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                    borderColor: alpha("#3b82f6", 0.3),
                    color: "#3b82f6",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "#3b82f6",
                      bgcolor: alpha("#3b82f6", 0.05),
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
                    },
                    "&:disabled": {
                      borderColor: alpha("#000", 0.12),
                      color: alpha("#000", 0.26),
                    },
                  }}
                >
                  {translateMutation.isPending
                    ? t("donations.translating")
                    : t("donations.translate")}
                </Button>
              )}

              {/* Enhanced Listen Button */}
              <Button
                startIcon={
                  ttsMutation.isPending ? (
                    <CircularProgress size={16} />
                  ) : (
                    <VolumeUp />
                  )
                }
                onClick={handleListen}
                disabled={ttsMutation.isPending || isPlaying}
                variant="outlined"
                size="small"
                sx={{
                  textTransform: "none",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  borderColor: alpha("#10b981", 0.3),
                  color: "#10b981",
                  transition: "all 0.2s",
                  ...(isPlaying && {
                    bgcolor: alpha("#10b981", 0.08),
                    borderColor: "#10b981",
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    "@keyframes pulse": {
                      "0%, 100%": {
                        opacity: 1,
                      },
                      "50%": {
                        opacity: 0.7,
                      },
                    },
                  }),
                  "&:hover": {
                    borderColor: "#10b981",
                    bgcolor: alpha("#10b981", 0.05),
                    transform: "translateY(-1px)",
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
                  },
                  "&:disabled": {
                    borderColor: alpha("#000", 0.12),
                    color: alpha("#000", 0.26),
                  },
                }}
              >
                {ttsMutation.isPending
                  ? t("donations.generating")
                  : isPlaying
                  ? t("donations.playing")
                  : t("donations.listen")}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("donations.details") || "Details"}
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Inventory color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t("donations.quantity") || "Quantity"}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {donation.quantity} {donation.unit}
                  </Typography>
                </Box>
              </Box>

              {donation.estimatedValue && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <AttachMoney color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("donations.estimatedValue") || "Estimated Value"}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      ${donation.estimatedValue}
                    </Typography>
                  </Box>
                </Box>
              )}

              {donation.weight && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Scale color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("donations.weight") || "Weight"}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {donation.weight} kg
                    </Typography>
                  </Box>
                </Box>
              )}

              {donation.expiryDate && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CalendarToday color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("donations.expiryDate") || "Expiry Date"}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {new Date(donation.expiryDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>

            {donation.notes && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Notes color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("donations.notes") || "Additional Notes"}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {donation.notes}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            {/* Food Details */}
            {donation.isFood && donation.foodDetails && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Restaurant color="action" />
                  <Box sx={{ width: "100%" }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {t("donations.foodDetails") || "Food Details"}
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Cooked:</strong>{" "}
                        {donation.foodDetails.isCooked ? "Yes" : "No"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Packaged:</strong>{" "}
                        {donation.foodDetails.isPackaged ? "Yes" : "No"}
                      </Typography>
                      {donation.foodDetails.storageInstructions && (
                        <Typography variant="body2">
                          <strong>Storage:</strong>{" "}
                          {donation.foodDetails.storageInstructions}
                        </Typography>
                      )}
                      {donation.foodDetails.allergens &&
                        donation.foodDetails.allergens.length > 0 && (
                          <Box>
                            <Typography variant="body2" gutterBottom>
                              <strong>Allergens:</strong>
                            </Typography>
                            <Box
                              sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                            >
                              {donation.foodDetails.allergens.map(
                                (allergen) => (
                                  <Chip
                                    key={allergen}
                                    label={allergen}
                                    size="small"
                                  />
                                )
                              )}
                            </Box>
                          </Box>
                        )}
                    </Stack>
                  </Box>
                </Box>
              </>
            )}
          </Paper>

          {/* Pickup Location */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              <LocationOn sx={{ verticalAlign: "middle", mr: 1 }} />
              {t("donations.pickupLocation") || "Pickup Location"}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {donation.pickupLocation.address}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {donation.pickupLocation.city}
            </Typography>
            {donation.pickupTimeWindow && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Pickup Time Window:
                </Typography>
                <Typography variant="body2">
                  {new Date(donation.pickupTimeWindow.start).toLocaleString()} -{" "}
                  {new Date(donation.pickupTimeWindow.end).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Delivery Location - visible to donor, requester, driver, and admins */}
          {donation.deliveryLocation &&
            (hasPermission("donations.approve") || 
             user?.id === donation.donorId?._id || 
             user?.id === donation.requestedBy?._id ||
             user?.id === donation.assignedDriverId?._id) && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: alpha("#3b82f6", 0.05) }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                <LocalShipping sx={{ verticalAlign: "middle", mr: 1 }} />
                {t("donations.deliveryLocation") || "Delivery Location"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {donation.deliveryLocation.address}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {donation.deliveryLocation.city}
              </Typography>
              <Chip
                label={t("donations.deliveryRequired") || "Delivery Required"}
                color="primary"
                size="small"
                sx={{ mt: 2 }}
              />
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Donor Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("donations.donor") || "Donor"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <UserAvatar
                src={getProfileImageUrl(donation.donorId) || undefined}
                initials={getUserInitials(donation.donorId)}
                size={56}
                isVerified={isUserVerified(donation.donorId)}
                onClick={
                  hasPermission("users.view") && donation.donorId._id
                    ? () => navigate(`/profile/${donation.donorId._id}`)
                    : undefined
                }
                sx={{
                  cursor: hasPermission("users.view") ? "pointer" : "default",
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{
                    cursor: hasPermission("users.view") ? "pointer" : "default",
                    color: hasPermission("users.view") ? "primary.main" : "inherit",
                    "&:hover": hasPermission("users.view")
                      ? {
                          textDecoration: "underline",
                        }
                      : {},
                  }}
                  onClick={() => {
                    if (hasPermission("users.view") && donation.donorId._id) {
                      navigate(`/profile/${donation.donorId._id}`);
                    }
                  }}
                >
                  {donation.donorId.firstName} {donation.donorId.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("donations.donor") || "Donor"}
                </Typography>
                {(donation.donorId as any)?.donorRating > 0 && (
                  <StarRating
                    value={(donation.donorId as any)?.donorRating || 0}
                    count={(donation.donorId as any)?.donorRatingCount || 0}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Box>
              {hasPermission("users.view") && donation.donorId._id && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/profile/${donation.donorId._id}`)}
                  sx={{ minWidth: 100 }}
                >
                  View Profile
                </Button>
              )}
            </Box>
            {/* Donor contact info - only visible to requester, assigned driver, or admins */}
            {(user?.id === donation.requestedBy?._id ||
              user?.id === donation.assignedDriverId?._id ||
              hasPermission("donations.approve")) && (
              <Stack spacing={1}>
                {donation.donorId.email && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2">
                      {donation.donorId.email}
                    </Typography>
                  </Box>
                )}
                {donation.donorId.phone && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">
                      {typeof donation.donorId.phone === "string"
                        ? donation.donorId.phone
                        : `${donation.donorId.phone.countryCode} ${donation.donorId.phone.number}`}
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </Paper>

          {/* Requester Information - visible to donor, driver, and admins */}
          {donation.requestedBy &&
            (hasPermission("donations.approve") || 
             user?.id === donation.donorId?._id || 
             user?.id === donation.assignedDriverId?._id) && (
              <Paper sx={{ p: 3, mb: 3, bgcolor: alpha("#3b82f6", 0.05) }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {t("donations.requestedBy") || "Requested by"}
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <UserAvatar
                    src={
                      donation.requestedBy?.profileImage
                        ? getProfileImageUrl(donation.requestedBy)
                        : undefined
                    }
                    initials={donation.requestedBy ? getUserInitials(donation.requestedBy) : "?"}
                    size={56}
                    isVerified={isUserVerified(donation.requestedBy)}
                    onClick={
                      hasPermission("users.view") && donation.requestedBy._id
                        ? () => navigate(`/profile/${donation.requestedBy._id}`)
                        : undefined
                    }
                    sx={{
                      cursor: hasPermission("users.view") ? "pointer" : "default",
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      sx={{
                        cursor: hasPermission("users.view") ? "pointer" : "default",
                        color: hasPermission("users.view") ? "primary.main" : "inherit",
                        "&:hover": hasPermission("users.view")
                          ? {
                              textDecoration: "underline",
                            }
                          : {},
                      }}
                      onClick={() => {
                        if (hasPermission("users.view") && donation.requestedBy._id) {
                          navigate(`/profile/${donation.requestedBy._id}`);
                        }
                      }}
                    >
                      {donation.requestedBy.firstName &&
                      donation.requestedBy.lastName
                        ? `${donation.requestedBy.firstName} ${donation.requestedBy.lastName}`
                        : donation.requestedBy.email || "Unknown User"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {donation.requestedAt &&
                        new Date(donation.requestedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {hasPermission("users.view") && donation.requestedBy._id && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/profile/${donation.requestedBy._id}`)}
                      sx={{ minWidth: 100 }}
                    >
                      View Profile
                    </Button>
                  )}
                </Box>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {donation.requestedBy.email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">
                        {donation.requestedBy.email}
                      </Typography>
                    </Box>
                  )}
                  {donation.requestedBy.phone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">
                        {typeof donation.requestedBy.phone === "string"
                          ? donation.requestedBy.phone
                          : `${donation.requestedBy.phone.countryCode} ${donation.requestedBy.phone.number}`}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {/* Approval Actions - Only visible when status is REQUESTED and to donor/admins */}
                {donation.status === DonationStatus.REQUESTED && 
                 user && (hasPermission("donations.approve") || user.id === donation.donorId?._id) && (
                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={() => approveMutation.mutate()}
                      disabled={
                        approveMutation.isPending || rejectMutation.isPending
                      }
                    >
                      {approveMutation.isPending ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        t("donations.approveRequest") || "Approve Request"
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      onClick={() => {
                        const reason = window.prompt(
                          "Rejection reason (optional):"
                        );
                        if (reason !== null) {
                          rejectMutation.mutate(reason);
                        }
                      }}
                      disabled={
                        approveMutation.isPending || rejectMutation.isPending
                      }
                    >
                      {rejectMutation.isPending ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        t("donations.rejectRequest") || "Reject Request"
                      )}
                    </Button>
                  </Stack>
                )}
              </Paper>
            )}

          {/* Driver Information - visible to donor, requester, driver, and admins */}
          {donation.assignedDriverId &&
            (hasPermission("donations.approve") || 
             user?.id === donation.donorId?._id || 
             user?.id === donation.requestedBy?._id ||
             user?.id === donation.assignedDriverId?._id) && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t("donations.driver") || "Assigned Driver"}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <UserAvatar
                  src={getProfileImageUrl(donation.assignedDriverId) || undefined}
                  initials={getUserInitials(donation.assignedDriverId)}
                  size={56}
                  isVerified={isUserVerified(donation.assignedDriverId)}
                  onClick={
                    hasPermission("users.view") && donation.assignedDriverId._id
                      ? () => navigate(`/profile/${donation.assignedDriverId._id}`)
                      : undefined
                  }
                  sx={{
                    cursor: hasPermission("users.view") ? "pointer" : "default",
                  }}
                />
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {donation.assignedDriverId.firstName}{" "}
                    {donation.assignedDriverId.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("donations.driver") || "Driver"}
                  </Typography>
                  {(donation.assignedDriverId as any)?.driverInfo?.rating > 0 && (
                    <StarRating
                      value={(donation.assignedDriverId as any)?.driverInfo?.rating || 0}
                      count={(donation.assignedDriverId as any)?.driverInfo?.ratingCount || 0}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Box>
              {donation.assignedDriverId.phone && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">
                    {typeof donation.assignedDriverId.phone === "string"
                      ? donation.assignedDriverId.phone
                      : `${donation.assignedDriverId.phone.countryCode} ${donation.assignedDriverId.phone.number}`}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Timestamps */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("donations.timeline") || "Timeline"}
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t("donations.created") || "Created"}
                </Typography>
                <Typography variant="body2">
                  {new Date(donation.createdAt).toLocaleString()}
                </Typography>
              </Box>
              {donation.deliveredAt && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t("donations.delivered") || "Delivered"}
                  </Typography>
                  <Typography variant="body2">
                    {new Date(donation.deliveredAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Status Progress Timeline - Only visible to associated users and admins */}
        {user &&
          (user.id === donation.donorId?._id ||
            user.id === donation.requestedBy?._id ||
            user.id === donation.assignedDriverId?._id ||
            hasPermission("donations.approve")) && (
            <Grid item xs={12}>
              <DonationStatusTimeline
                currentStatus={donation.status}
                needsDelivery={!!donation.deliveryLocation || !!donation.needsDelivery}
              />
            </Grid>
          )}
      </Grid>

      {/* Delivery Request Dialog */}
      {donation && (
        <DeliveryRequestDialog
          open={showDeliveryDialog}
          onClose={() => setShowDeliveryDialog(false)}
          onConfirm={(deliveryInfo) => requestMutation.mutate(deliveryInfo)}
          loading={requestMutation.isPending}
          donationTitle={donation.title}
        />
      )}

      {/* Unassign Request Confirmation Dialog */}
      <Dialog
        open={showUnassignRequestDialog}
        onClose={() => setShowUnassignRequestDialog(false)}
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
          <Warning sx={{ color: "warning.main", fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {t("donations.cancelRequest") || "Cancel Request"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText>
            {t("donations.confirmUnassignRequest") || "Are you sure you want to cancel your request for this donation?"}
          </DialogContentText>
          {donation && (
            <Box sx={{ mt: 2, p: 2, bgcolor: alpha("#ff9800", 0.1), borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                {donation.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                The donation will return to pending status and be available for others to request.
              </Typography>
            </Box>
          )}
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
            onClick={() => setShowUnassignRequestDialog(false)}
            variant="outlined"
            color="inherit"
            sx={{ minWidth: 100 }}
          >
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            onClick={() => {
              unassignRequestMutation.mutate();
              setShowUnassignRequestDialog(false);
            }}
            variant="contained"
            color="warning"
            disabled={unassignRequestMutation.isPending}
            startIcon={unassignRequestMutation.isPending ? <CircularProgress size={16} /> : <Warning />}
            sx={{ minWidth: 140 }}
          >
            {unassignRequestMutation.isPending ? "Canceling..." : "Confirm Cancel"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unassign Driver Confirmation Dialog */}
      <Dialog
        open={showUnassignDriverDialog}
        onClose={() => setShowUnassignDriverDialog(false)}
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
          <Warning sx={{ color: "warning.main", fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {t("donations.unassignDriver") || "Unassign from Delivery"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText>
            {t("donations.confirmUnassignDriver") || "Are you sure you want to unassign yourself from this delivery?"}
          </DialogContentText>
          {donation && (
            <Box sx={{ mt: 2, p: 2, bgcolor: alpha("#ff9800", 0.1), borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                {donation.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                The delivery will be available for other drivers to accept.
              </Typography>
            </Box>
          )}
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
            onClick={() => setShowUnassignDriverDialog(false)}
            variant="outlined"
            color="inherit"
            sx={{ minWidth: 100 }}
          >
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            onClick={() => {
              unassignDriverMutation.mutate();
              setShowUnassignDriverDialog(false);
            }}
            variant="contained"
            color="warning"
            disabled={unassignDriverMutation.isPending}
            startIcon={unassignDriverMutation.isPending ? <CircularProgress size={16} /> : <Warning />}
            sx={{ minWidth: 140 }}
          >
            {unassignDriverMutation.isPending ? "Unassigning..." : "Confirm Unassign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Driver Rating Dialog */}
      {donation && canRateData?.data?.driverToRate && (
        <RatingDialog
          open={showDriverRatingDialog}
          onClose={() => setShowDriverRatingDialog(false)}
          onSubmit={(value, comment) =>
            handleSubmitRating(RatingType.DRIVER_RATING, value, comment)
          }
          loading={createRatingMutation.isPending}
          type={RatingType.DRIVER_RATING}
          userToRate={canRateData.data.driverToRate}
          donationTitle={donation.title}
        />
      )}

      {/* Donor Rating Dialog */}
      {donation && canRateData?.data?.donorToRate && (
        <RatingDialog
          open={showDonorRatingDialog}
          onClose={() => setShowDonorRatingDialog(false)}
          onSubmit={(value, comment) =>
            handleSubmitRating(RatingType.DONOR_RATING, value, comment)
          }
          loading={createRatingMutation.isPending}
          type={RatingType.DONOR_RATING}
          userToRate={canRateData.data.donorToRate}
          donationTitle={donation.title}
        />
      )}
    </Container>
  );
};

export default DonationDetailPage;
