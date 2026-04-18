import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface RequestFiltersProps {
  filters: {
    category: string;
    urgency: string;
    status: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export const RequestFilters = ({
  filters,
  onFilterChange,
}: RequestFiltersProps) => {
  const { t } = useTranslation();

  const categories = [
    { value: "all", label: t("requests.filters.allCategories") },
    { value: "food", label: t("donations.categories.food") },
    { value: "clothing", label: t("donations.categories.clothing") },
    { value: "electronics", label: t("donations.categories.electronics") },
    { value: "furniture", label: t("donations.categories.furniture") },
    { value: "books", label: t("donations.categories.books") },
    { value: "toys", label: t("donations.categories.toys") },
    { value: "other", label: t("donations.categories.other") },
  ];

  const urgencies = [
    { value: "all", label: t("requests.filters.allUrgencies") },
    { value: "low", label: t("requests.urgency.low") },
    { value: "medium", label: t("requests.urgency.medium") },
    { value: "high", label: t("requests.urgency.high") },
    { value: "critical", label: t("requests.urgency.critical") },
  ];

  const statuses = [
    { value: "all", label: t("requests.filters.allStatuses") },
    { value: "open", label: t("requests.status.open") },
    { value: "matched", label: t("requests.status.matched") },
    { value: "in_progress", label: t("requests.status.inProgress") },
    { value: "completed", label: t("requests.status.completed") },
    { value: "cancelled", label: t("requests.status.cancelled") },
  ];

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          placeholder={t("requests.filters.search")}
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{t("requests.filters.category")}</InputLabel>
          <Select
            value={filters.category}
            label={t("requests.filters.category")}
            onChange={(e) => onFilterChange("category", e.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{t("requests.filters.urgency")}</InputLabel>
          <Select
            value={filters.urgency}
            label={t("requests.filters.urgency")}
            onChange={(e) => onFilterChange("urgency", e.target.value)}
          >
            {urgencies.map((urgency) => (
              <MenuItem key={urgency.value} value={urgency.value}>
                {urgency.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{t("requests.filters.status")}</InputLabel>
          <Select
            value={filters.status}
            label={t("requests.filters.status")}
            onChange={(e) => onFilterChange("status", e.target.value)}
          >
            {statuses.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

