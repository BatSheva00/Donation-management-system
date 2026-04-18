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
import { DonationFilters as FilterType } from "../types/donation.types";

interface DonationFiltersProps {
  filters: FilterType;
  onFilterChange: (key: string, value: string) => void;
}

export const DonationFilters = ({
  filters,
  onFilterChange,
}: DonationFiltersProps) => {
  const { t } = useTranslation();

  const categories = [
    { value: "", label: t("donations.filters.allCategories") || "All Categories" },
    { value: "food", label: t("donations.categories.food") || "Food" },
    { value: "clothing", label: t("donations.categories.clothing") || "Clothing" },
    { value: "electronics", label: t("donations.categories.electronics") || "Electronics" },
    { value: "furniture", label: t("donations.categories.furniture") || "Furniture" },
    { value: "books", label: t("donations.categories.books") || "Books" },
    { value: "toys", label: t("donations.categories.toys") || "Toys" },
    { value: "other", label: t("donations.categories.other") || "Other" },
  ];

  const statuses = [
    { value: "", label: t("donations.filters.allStatuses") || "All Statuses" },
    { value: "pending", label: t("donations.status.pending") || "Pending" },
    { value: "approved", label: t("donations.status.approved") || "Approved" },
    { value: "assigned", label: t("donations.status.assigned") || "Assigned" },
    { value: "in_transit", label: t("donations.status.in_transit") || "In Transit" },
    { value: "delivered", label: t("donations.status.delivered") || "Delivered" },
    { value: "completed", label: t("donations.status.completed") || "Completed" },
    { value: "cancelled", label: t("donations.status.cancelled") || "Cancelled" },
    { value: "rejected", label: t("donations.status.rejected") || "Rejected" },
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
          placeholder={t("donations.filters.search") || "Search donations..."}
          value={filters.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
          sx={{ flexGrow: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t("donations.filters.category") || "Category"}</InputLabel>
          <Select
            value={filters.type || ""}
            label={t("donations.filters.category") || "Category"}
            onChange={(e) => onFilterChange("type", e.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t("donations.filters.status") || "Status"}</InputLabel>
          <Select
            value={filters.status || ""}
            label={t("donations.filters.status") || "Status"}
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

