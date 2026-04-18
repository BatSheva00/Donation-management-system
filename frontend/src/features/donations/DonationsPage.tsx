import { Container, Typography, Button, Box, Pagination } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useDonations } from "./hooks/useDonations";
import { useDonationForm } from "./hooks/useDonationForm";
import {
  DonationFilters,
  DonationList,
  CreateDonationModal,
} from "./components";

const DonationsPage = () => {
  const { t } = useTranslation();
  const { donations, isLoading, filters, pagination, handleFilterChange, handlePageChange } = useDonations();
  const {
    open,
    formData,
    handleOpen,
    handleClose,
    handleFieldChange,
    handleNestedFieldChange,
    handleSubmit,
    isCreating,
  } = useDonationForm();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            {t("pages.donations.title") || "Donations"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("pages.donations.subtitle") || "Browse and create donations"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
          sx={{
            background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
          }}
        >
          {t("dashboard.createDonation") || "Create Donation"}
        </Button>
      </Box>

      {/* Filters */}
      <DonationFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Donations List */}
      <DonationList donations={donations} isLoading={isLoading} />

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={(_, page) => handlePageChange(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Create Donation Modal */}
      <CreateDonationModal
        open={open}
        formData={formData}
        isCreating={isCreating}
        onClose={handleClose}
        onFieldChange={handleFieldChange}
        onNestedFieldChange={handleNestedFieldChange}
        onSubmit={handleSubmit}
      />
    </Container>
  );
};

export default DonationsPage;

