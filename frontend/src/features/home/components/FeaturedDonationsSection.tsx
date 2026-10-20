import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "../../../lib/axios";
import { DonationResponse } from "../../donations/types/donation.types";
import { DonationList } from "../../donations/components";

export const FeaturedDonationsSection = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery<DonationResponse>({
    queryKey: ["home-donations"],
    queryFn: async () => {
      const response = await api.get("/donations", {
        params: { page: 1, limit: 6, sortBy: "createdAt", sortOrder: "desc" },
      });
      return response.data;
    },
  });

  const donations = data?.data || [];
  if (!isLoading && donations.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: 8, bgcolor: "background.paper" }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
              {t("home.featured.title")}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {t("home.featured.subtitle")}
            </Typography>
          </Box>
          <Button component={Link} to="/donations" variant="outlined">
            {t("home.featured.viewAll")}
          </Button>
        </Stack>
        <DonationList donations={donations} isLoading={isLoading} />
      </Container>
    </Box>
  );
};
