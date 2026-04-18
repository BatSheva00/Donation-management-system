import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
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
  Notes,
  Translate as TranslateIcon,
  Undo,
  VolumeUp,
  LocalShipping,
  Warning,
  Edit,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import api from "../../lib/axios";
import { IRequest, RequestStatus } from "./types/request.types";
import { useAuthStore } from "../../shared/stores/authStore";
import UserAvatar from "../../shared/components/shared/UserAvatar";
import {
  useFulfillRequest,
  useRetractFulfillment,
  useCancelRequest,
  useMarkCompleted,
  useUpdateRequest,
} from "./hooks/useRequests";
import { RequestFormModal } from "./components/RequestFormModal";

const RequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, hasPermission } = useAuthStore();
  const queryClient = useQueryClient();
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  const { data, isLoading, error } = useQuery<{
    success: boolean;
    data: IRequest;
  }>({
    queryKey: ["request", id],
    queryFn: async () => {
      const response = await api.get(`/requests/${id}`);
      return response.data;
    },
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const request = data?.data;

  const fulfillMutation = useFulfillRequest();
  const retractMutation = useRetractFulfillment();
  const cancelMutation = useCancelRequest();
  const completeMutation = useMarkCompleted();
  const updateMutation = useUpdateRequest();

  // Translation mutation
  const translateMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await api.post("/translate", { text });
      return response.data.data;
    },
    onSuccess: (data) => {
      setTranslatedDescription(data.translatedText);
    },
  });

  // Text-to-Speech mutation
  const ttsMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await api.post("/tts", { text }, { responseType: "blob" });
      return response.data;
    },
    onSuccess: (audioBlob) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    },
  });

  const handleTranslate = () => {
    if (request?.description) {
      translateMutation.mutate(request.description);
    }
  };

  const handleListen = () => {
    const textToSpeak = translatedDescription || request?.description;
    if (textToSpeak) {
      ttsMutation.mutate(textToSpeak);
    }
  };

  const handleFulfill = async () => {
    if (!id) return;
    try {
      await fulfillMutation.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: ["request", id] });
    } catch (error) {
      console.error("Failed to fulfill request:", error);
    }
  };

  const handleRetract = async () => {
    if (!id) return;
    try {
      await retractMutation.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: ["request", id] });
    } catch (error) {
      console.error("Failed to retract fulfillment:", error);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      await cancelMutation.mutateAsync(id);
      setShowCancelDialog(false);
      queryClient.invalidateQueries({ queryKey: ["request", id] });
    } catch (error) {
      console.error("Failed to cancel request:", error);
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    try {
      await completeMutation.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: ["request", id] });
    } catch (error) {
      console.error("Failed to complete request:", error);
    }
  };

  const handleOpenEdit = () => {
    if (!request) return;
    setEditFormData({
      title: request.title,
      description: request.description,
      category: request.category,
      quantity: request.quantity,
      urgency: request.urgency,
      needsDelivery: request.needsDelivery,
      deliveryAddress: request.deliveryAddress,
      notes: request.notes || "",
    });
    setOpenEditModal(true);
  };

  const handleEditFieldChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditNestedFieldChange = (parent: string, field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleUpdateRequest = async () => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({ id, data: editFormData });
      setOpenEditModal(false);
      queryClient.invalidateQueries({ queryKey: ["request", id] });
    } catch (error) {
      console.error("Failed to update request:", error);
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    const colors: Record<string, string> = {
      pending: "#f59e0b",
      approved: "#10b981",
      fulfilled: "#3b82f6",
      waiting_for_delivery: "#8b5cf6",
      in_transit: "#8b5cf6",
      delivered: "#10b981",
      completed: "#6b7280",
      cancelled: "#ef4444",
      rejected: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      low: "#10b981",
      medium: "#f59e0b",
      high: "#ef4444",
    };
    return colors[urgency] || "#6b7280";
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

  if (error || !request) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {t("requests.notFound") || "Request not found"}
        </Alert>
      </Container>
    );
  }

  // Check if user is involved in this request
  const isRequester = user?.id === request.requesterId._id;
  const isFulfiller = user?.id === request.fulfilledBy?._id;
  const isDriver = user?.id === request.assignedDriverId?._id;
  const isInvolved = isRequester || isFulfiller || isDriver || hasPermission("donations.approve");

  // Determine if user can fulfill the request
  const canFulfill =
    user &&
    !isRequester &&
    (user.role?.key === "business" || user.role?.key === "user") &&
    request.status === RequestStatus.APPROVED;

  // Determine if user can cancel
  const canCancel =
    isRequester &&
    (request.status === RequestStatus.PENDING ||
      request.status === RequestStatus.APPROVED);

  // Determine if user can complete
  const canComplete =
    isRequester &&
    ((request.status === RequestStatus.FULFILLED && !request.needsDelivery) ||
      (request.status === RequestStatus.DELIVERED && request.needsDelivery));

  // Determine if user can retract fulfillment
  const canRetract =
    isFulfiller &&
    (request.status === RequestStatus.FULFILLED ||
      request.status === RequestStatus.WAITING_FOR_DELIVERY);

  // Determine if user can edit (only before someone takes/fulfills the request)
  const canEdit =
    isRequester &&
    (request.status === RequestStatus.PENDING ||
      request.status === RequestStatus.APPROVED ||
      request.status === RequestStatus.REJECTED);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        {t("common.back") || "Back"}
      </Button>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Request Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Status & Category Chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
              <Chip
                label={request.status.replace(/_/g, " ")}
                sx={{
                  bgcolor: alpha(getStatusColor(request.status), 0.1),
                  color: getStatusColor(request.status),
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              />
              <Chip
                label={request.category}
                sx={{
                  bgcolor: alpha("#3b82f6", 0.1),
                  color: "#3b82f6",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              />
              <Chip
                label={`${t("requests.urgency." + request.urgency)} ${t("requests.urgency")}`}
                sx={{
                  bgcolor: alpha(getUrgencyColor(request.urgency), 0.1),
                  color: getUrgencyColor(request.urgency),
                  fontWeight: 600,
                }}
              />
              {request.needsDelivery && (
                <Chip
                  icon={<LocalShipping />}
                  label={t("requests.needsDelivery") || "Needs Delivery"}
                  sx={{
                    bgcolor: alpha("#8b5cf6", 0.1),
                    color: "#8b5cf6",
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>

            {/* Title */}
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {request.title}
            </Typography>

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  {t("requests.description") || "Description"}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<VolumeUp />}
                    onClick={handleListen}
                    disabled={ttsMutation.isPending}
                  >
                    {t("common.listen") || "Listen"}
                  </Button>
                  {translatedDescription ? (
                    <Button
                      size="small"
                      startIcon={<Undo />}
                      onClick={() => setTranslatedDescription(null)}
                    >
                      {t("common.original") || "Original"}
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      startIcon={<TranslateIcon />}
                      onClick={handleTranslate}
                      disabled={translateMutation.isPending}
                    >
                      {t("common.translate") || "Translate"}
                    </Button>
                  )}
                </Stack>
              </Box>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {translatedDescription || request.description}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Additional Details */}
            <Grid container spacing={2}>
              {request.quantity && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Inventory color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("requests.quantity") || "Quantity"}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {request.quantity}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("requests.createdAt") || "Created"}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {request.notes && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Notes color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      {t("requests.notes") || "Notes"}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{request.notes}</Typography>
                </Box>
              </>
            )}
          </Paper>

          {/* Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {t("requests.actions") || "Actions"}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {canEdit && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleOpenEdit}
                >
                  {t("requests.editRequest") || "Edit Request"}
                </Button>
              )}
              {canFulfill && (
                <Button
                  variant="contained"
                  onClick={handleFulfill}
                  disabled={fulfillMutation.isPending}
                >
                  {fulfillMutation.isPending
                    ? t("common.processing") || "Processing..."
                    : t("requests.fulfillRequest") || "Fulfill This Request"}
                </Button>
              )}
              {canRetract && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleRetract}
                  disabled={retractMutation.isPending}
                >
                  {retractMutation.isPending
                    ? t("common.processing") || "Processing..."
                    : t("requests.retractFulfillment") || "Retract Fulfillment"}
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setShowCancelDialog(true)}
                >
                  {t("requests.cancelRequest") || "Cancel Request"}
                </Button>
              )}
              {canComplete && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                >
                  {completeMutation.isPending
                    ? t("common.processing") || "Processing..."
                    : t("requests.markComplete") || "Mark as Completed"}
                </Button>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column - Additional Info */}
        <Grid item xs={12} md={4}>
          {/* Requester Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {t("requests.requester") || "Requester"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <UserAvatar user={request.requesterId} sx={{ width: 56, height: 56 }} />
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {request.requesterId.firstName} {request.requesterId.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {request.requesterId.email}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Fulfiller Info (if fulfilled and user is involved) */}
          {request.fulfilledBy && isInvolved && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t("requests.fulfilledBy") || "Fulfilled By"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <UserAvatar user={request.fulfilledBy} sx={{ width: 56, height: 56 }} />
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {request.fulfilledBy.firstName} {request.fulfilledBy.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {request.fulfilledBy.email}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Driver Info (if assigned and user is involved) */}
          {request.assignedDriverId && isInvolved && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t("requests.assignedDriver") || "Assigned Driver"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <UserAvatar user={request.assignedDriverId} sx={{ width: 56, height: 56 }} />
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {request.assignedDriverId.firstName} {request.assignedDriverId.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {request.assignedDriverId.email}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Delivery Address (if needs delivery and user is involved) */}
          {request.needsDelivery && request.deliveryAddress && isInvolved && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <LocalShipping color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {t("requests.deliveryAddress") || "Delivery Address"}
                </Typography>
              </Box>
              <Typography variant="body2">
                {request.deliveryAddress.street}
              </Typography>
              <Typography variant="body2">
                {request.deliveryAddress.city}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>
          {t("requests.confirmCancel") || "Cancel Request?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("requests.confirmCancelMessage") ||
              "Are you sure you want to cancel this request? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>
            {t("common.no") || "No"}
          </Button>
          <Button
            onClick={handleCancel}
            color="error"
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending
              ? t("common.processing") || "Processing..."
              : t("common.yes") || "Yes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Request Modal */}
      <RequestFormModal
        open={openEditModal}
        mode="edit"
        formData={editFormData}
        isSubmitting={updateMutation.isPending}
        onClose={() => setOpenEditModal(false)}
        onFieldChange={handleEditFieldChange}
        onNestedFieldChange={handleEditNestedFieldChange}
        onSubmit={handleUpdateRequest}
      />
    </Container>
  );
};

export default RequestDetailPage;

