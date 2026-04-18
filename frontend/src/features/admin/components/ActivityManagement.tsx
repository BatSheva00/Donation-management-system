import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Stack,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Search, Refresh, Person, CalendarToday } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import api from "../../../lib/axios";

interface Activity {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  type: string;
  title: string;
  description: string;
  createdAt: string;
  metadata?: any;
}

const activityTypes = [
  "donation_created",
  "donation_requested",
  "donation_approved",
  "donation_rejected",
  "donation_delivered",
  "donation_completed",
  "driver_assigned",
  "driver_in_transit",
];

const getActivityColor = (type: string): "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success" => {
  if (type.includes("created")) return "primary";
  if (type.includes("requested")) return "warning";
  if (type.includes("approved") || type.includes("completed")) return "success";
  if (type.includes("rejected")) return "error";
  if (type.includes("driver") || type.includes("transit")) return "info";
  if (type.includes("delivered")) return "secondary";
  return "default";
};

const translateActivityType = (type: string, t: any): string => {
  const translations: { [key: string]: string } = {
    donation_created: t("activities.donationCreated") || "Created a donation",
    donation_requested: t("activities.donationRequested") || "Requested a donation",
    donation_approved: t("activities.donationApproved") || "Donation request approved",
    donation_rejected: t("activities.donationRejected") || "Donation request rejected",
    donation_delivered: t("activities.donationDelivered") || "Delivery completed",
    donation_completed: t("activities.donationCompleted") || "Donation received",
    driver_assigned: t("activities.driverAssigned") || "Assigned to delivery",
    driver_in_transit: t("activities.driverInTransit") || "Delivery in transit",
  };
  return translations[type] || type.replace(/_/g, " ");
};

const ActivityManagement = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [userSearch, setUserSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-activities", page, rowsPerPage, typeFilter, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", (page + 1).toString());
      params.append("limit", rowsPerPage.toString());
      if (typeFilter) params.append("type", typeFilter);
      if (startDate) params.append("startDate", new Date(startDate).toISOString());
      if (endDate) params.append("endDate", new Date(endDate).toISOString());

      const response = await api.get(`/activities/all?${params.toString()}`);
      return response.data;
    },
    staleTime: 0,
    cacheTime: 0,
  });

  const activities: Activity[] = data?.data || [];
  const total = data?.pagination?.total || 0;

  // Filter by user search on frontend
  const filteredActivities = userSearch
    ? activities.filter(
        (activity) =>
          activity.userId?.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
          activity.userId?.lastName?.toLowerCase().includes(userSearch.toLowerCase()) ||
          activity.userId?.email?.toLowerCase().includes(userSearch.toLowerCase())
      )
    : activities;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t("admin.activityManagement") || "Activity Management"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("admin.viewAllUserActivities") || "View and monitor all user activities"}
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            label={t("admin.searchUser") || "Search User"}
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            label={t("admin.activityType") || "Activity Type"}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            size="small"
            sx={{ 
              minWidth: 200,
              "& .MuiSelect-icon": {
                left: isRTL ? 7 : "auto",
                right: isRTL ? "auto" : 7,
              },
            }}
            SelectProps={{
              MenuProps: {
                sx: {
                  "& .MuiMenuItem-root": {
                    direction: isRTL ? "rtl" : "ltr",
                  },
                },
              },
            }}
          >
            <MenuItem value="">{t("admin.allTypes") || "All Types"}</MenuItem>
            {activityTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {translateActivityType(type, t)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="date"
            label={t("admin.startDate") || "Start Date"}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          <TextField
            type="date"
            label={t("admin.endDate") || "End Date"}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          <IconButton onClick={() => refetch()} color="primary">
            <Refresh />
          </IconButton>
        </Stack>
      </Paper>

      {/* Activities Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("admin.user") || "User"}</TableCell>
                <TableCell>{t("admin.activityType") || "Activity Type"}</TableCell>
                <TableCell>{t("admin.description") || "Description"}</TableCell>
                <TableCell>{t("admin.date") || "Date"}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("admin.noActivities") || "No activities found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => (
                  <TableRow key={activity._id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Person fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {activity.userId?.firstName} {activity.userId?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.userId?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={translateActivityType(activity.type, t)}
                        size="small"
                        color={getActivityColor(activity.type)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{activity.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                            locale: isRTL ? he : undefined,
                          })}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage={t("admin.rowsPerPage") || "Rows per page:"}
          labelDisplayedRows={({ from, to, count }) =>
            isRTL
              ? `${from}-${to} מתוך ${count !== -1 ? count : `יותר מ-${to}`}`
              : `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </Paper>
    </Box>
  );
};

export default ActivityManagement;

