import { Grid, Box, Typography, CircularProgress } from "@mui/material";
import { Inventory } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Request } from "../types/request.types";
import { RequestCard } from "./RequestCard";

interface RequestListProps {
  requests: Request[];
  isLoading: boolean;
}

export const RequestList = ({ requests, isLoading }: RequestListProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (requests.length === 0) {
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
          {t("requests.noRequests")}
        </Typography>
        <Typography variant="body2">
          {t("requests.noRequestsDesc")}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {requests.map((request) => (
        <Grid item xs={12} sm={6} md={4} key={request._id}>
          <RequestCard request={request} />
        </Grid>
      ))}
    </Grid>
  );
};

