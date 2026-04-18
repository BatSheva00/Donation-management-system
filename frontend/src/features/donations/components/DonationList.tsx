import { Grid, Box, Typography, CircularProgress } from "@mui/material";
import { Inventory } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Donation } from "../types/donation.types";
import { DonationCard } from "./DonationCard";

interface DonationListProps {
  donations: Donation[];
  isLoading: boolean;
}

export const DonationList = ({ donations, isLoading }: DonationListProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (donations.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          color: "text.secondary",
        }}
      >
        <Inventory sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t("donations.noDonations")}
        </Typography>
        <Typography variant="body2">
          {t("donations.noDonationsDesc")}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {donations.map((donation) => (
        <Grid item xs={12} sm={6} md={4} key={donation._id}>
          <DonationCard donation={donation} />
        </Grid>
      ))}
    </Grid>
  );
};

