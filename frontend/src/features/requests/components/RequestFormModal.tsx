import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useAuthStore } from "../../../shared/stores/authStore";

interface RequestFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  formData: any;
  isSubmitting: boolean;
  onClose: () => void;
  onFieldChange: (field: string, value: any) => void;
  onNestedFieldChange: (parent: string, field: string, value: any) => void;
  onSubmit: () => void;
}

export const RequestFormModal = ({
  open,
  mode,
  formData,
  isSubmitting,
  onClose,
  onFieldChange,
  onNestedFieldChange,
  onSubmit,
}: RequestFormModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const isEditMode = mode === "edit";

  // Auto-fill delivery address when needsDelivery is checked and not yet filled
  useEffect(() => {
    if (formData.needsDelivery && user?.address && !formData.deliveryAddress?.street) {
      onNestedFieldChange("deliveryAddress", "street", user.address.street || "");
      onNestedFieldChange("deliveryAddress", "city", user.address.city || "");
    }
  }, [formData.needsDelivery, user, onNestedFieldChange]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditMode
          ? t("requests.editRequest") || "Edit Request"
          : t("requests.createNew") || "Create New Request"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              {t("requests.form.basicInfo") || "Basic Information"}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("requests.form.title") || "Title"}
              value={formData.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              required
              placeholder="e.g., Need Winter Clothing"
            />
          </Grid>

          <Grid item xs={12}>
            <Box>
              <TextField
                fullWidth
                label={t("requests.form.description") || "Description"}
                value={formData.description}
                onChange={(e) => onFieldChange("description", e.target.value)}
                multiline
                rows={4}
                required
                placeholder={
                  t("requests.form.descriptionPlaceholder") ||
                  "Provide details about what you need and why..."
                }
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>{t("requests.form.category") || "Category"}</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => onFieldChange("category", e.target.value)}
                label={t("requests.form.category") || "Category"}
              >
                <MenuItem value="food">{t("donations.categories.food") || "Food"}</MenuItem>
                <MenuItem value="clothing">{t("donations.categories.clothing") || "Clothing"}</MenuItem>
                <MenuItem value="furniture">{t("donations.categories.furniture") || "Furniture"}</MenuItem>
                <MenuItem value="electronics">{t("donations.categories.electronics") || "Electronics"}</MenuItem>
                <MenuItem value="books">{t("donations.categories.books") || "Books"}</MenuItem>
                <MenuItem value="toys">{t("donations.categories.toys") || "Toys"}</MenuItem>
                <MenuItem value="medical">{t("donations.categories.medical") || "Medical"}</MenuItem>
                <MenuItem value="other">{t("donations.categories.other") || "Other"}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>{t("requests.form.urgency") || "Urgency"}</InputLabel>
              <Select
                value={formData.urgency}
                onChange={(e) => onFieldChange("urgency", e.target.value)}
                label={t("requests.form.urgency") || "Urgency"}
              >
                <MenuItem value="low">{t("requests.urgency.low") || "Low"}</MenuItem>
                <MenuItem value="medium">{t("requests.urgency.medium") || "Medium"}</MenuItem>
                <MenuItem value="high">{t("requests.urgency.high") || "High"}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label={t("requests.form.quantity") || "Quantity (Optional)"}
              value={formData.quantity || ""}
              onChange={(e) => onFieldChange("quantity", e.target.value ? Number(e.target.value) : undefined)}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          {/* Delivery Option */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              {t("requests.form.deliveryOptions") || "Delivery Options"}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.needsDelivery || false}
                  onChange={(e) => onFieldChange("needsDelivery", e.target.checked)}
                />
              }
              label={t("requests.form.needsDelivery") || "I need delivery"}
            />
          </Grid>

          {/* Delivery Address (conditional) */}
          {formData.needsDelivery && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {t("requests.form.deliveryAddress") || "Delivery Address"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("address.street") || "Street Address"}
                  value={formData.deliveryAddress?.street || ""}
                  onChange={(e) => onNestedFieldChange("deliveryAddress", "street", e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("address.city") || "City"}
                  value={formData.deliveryAddress?.city || ""}
                  onChange={(e) => onNestedFieldChange("deliveryAddress", "city", e.target.value)}
                  required
                />
              </Grid>
            </>
          )}

          {/* Additional Details */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              {t("requests.form.additionalDetails") || "Additional Details"}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("requests.form.notes") || "Notes"}
              value={formData.notes || ""}
              onChange={(e) => onFieldChange("notes", e.target.value)}
              multiline
              rows={2}
              placeholder={
                t("requests.form.notesPlaceholder") ||
                "Any additional information..."
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t("common.cancel") || "Cancel"}
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={isSubmitting}>
          {isSubmitting
            ? isEditMode
              ? t("common.saving") || "Saving..."
              : t("common.creating") || "Creating..."
            : isEditMode
              ? t("common.save") || "Save"
              : t("common.create") || "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
