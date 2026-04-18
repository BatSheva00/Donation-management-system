import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useRequests, useCreateRequest } from "./hooks/useRequests";
import { RequestStatus } from "./types/request.types";
import { RequestFormModal } from "./components/RequestFormModal";
import { RequestCard } from "./components/RequestCard";
import { useAuthStore } from "../../shared/stores/authStore";

export const RequestsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"all" | "food" | "clothing" | "other">("all");
  const [page, setPage] = useState(1);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    category: "",
    quantity: undefined,
    urgency: "medium",
    needsDelivery: false,
    deliveryAddress: undefined,
    notes: "",
  });

  const categoryFilter =
    tab === "all" ? undefined : tab === "other" ? undefined : tab;

  const { data, isLoading, error } = useRequests({
    status: RequestStatus.APPROVED,
    category: categoryFilter,
    page,
    limit: 12,
  });

  const createRequest = useCreateRequest();

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNestedFieldChange = (
    parent: string,
    field: string,
    value: any
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      await createRequest.mutateAsync(formData);
      setOpenCreateModal(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        quantity: undefined,
        urgency: "medium",
        needsDelivery: false,
        deliveryAddress: undefined,
        notes: "",
      });
    } catch (error) {
      console.error("Failed to create request:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <div>
          <Typography variant="h4" gutterBottom>
            {t("requests.title") || "Donation Requests"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("requests.subtitle") ||
              "Help fulfill someone's need by donating what they request"}
          </Typography>
        </div>
        {user &&
          user.role?.key !== "driver" &&
          user.role?.key !== "business" && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenCreateModal(true)}
            >
              {t("requests.createNew") || "Create Request"}
            </Button>
          )}
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label={t("donations.categories.all") || "All"} value="all" />
          <Tab label={t("donations.categories.food") || "Food"} value="food" />
          <Tab
            label={t("donations.categories.clothing") || "Clothing"}
            value="clothing"
          />
          <Tab
            label={t("donations.categories.other") || "Other"}
            value="other"
          />
        </Tabs>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t("common.error") || "Failed to load requests"}
        </Alert>
      )}

      {/* Requests Grid */}
      {data && data.data && (
        <>
          {data.data.length === 0 ? (
            <Alert severity="info">
              {t("requests.noRequests") ||
                "No requests available at the moment"}
            </Alert>
          ) : (
            <>
              <Grid container spacing={3}>
                {data.data.map((request: any) => (
                  <Grid item xs={12} sm={6} md={4} key={request._id}>
                    <RequestCard request={request} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {data.pagination && data.pagination.pages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={data.pagination.pages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* Create Request Modal */}
      <RequestFormModal
        open={openCreateModal}
        mode="create"
        formData={formData}
        isSubmitting={createRequest.isPending}
        onClose={() => setOpenCreateModal(false)}
        onFieldChange={handleFieldChange}
        onNestedFieldChange={handleNestedFieldChange}
        onSubmit={handleSubmit}
      />
    </Container>
  );
};
