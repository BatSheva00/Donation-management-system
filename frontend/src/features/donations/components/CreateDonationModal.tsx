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
  IconButton,
  alpha,
} from "@mui/material";
import { Close, CloudUpload } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { DonationType } from "../types/donation.types";
import AddressAutocomplete from "../../../shared/components/forms/AddressAutocomplete";

interface CreateDonationModalProps {
  open: boolean;
  formData: any;
  isCreating: boolean;
  onClose: () => void;
  onFieldChange: (field: string, value: any) => void;
  onNestedFieldChange: (parent: string, field: string, value: any) => void;
  onSubmit: () => void;
}

export const CreateDonationModal = ({
  open,
  formData,
  isCreating,
  onClose,
  onFieldChange,
  onNestedFieldChange,
  onSubmit,
}: CreateDonationModalProps) => {
  const { t } = useTranslation();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, 5); // Max 5 images
    const previews: string[] = [];
    
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === fileArray.length) {
          setImagePreviews(previews);
          onFieldChange("images", previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    onFieldChange("images", newPreviews);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {t("donations.createNew") || "Create New Donation"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              {t("donations.form.basicInfo") || "Basic Information"}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("donations.form.title") || "Title"}
              value={formData.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              required
              placeholder="e.g., Fresh Vegetables"
            />
          </Grid>

          <Grid item xs={12}>
            <Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t("donations.form.description") || "Description"}
                value={formData.description}
                onChange={(e) => onFieldChange("description", e.target.value)}
                required
                placeholder="Describe your donation in detail"
              />
            </Box>
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("donations.form.images") || "Images (Optional)"}
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                {t("donations.form.uploadImages") || "Upload Images"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </Button>
              {imagePreviews.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {imagePreviews.map((preview, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        width: 100,
                        height: 100,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: alpha("#000", 0.6),
                          color: "white",
                          "&:hover": {
                            bgcolor: alpha("#000", 0.8),
                          },
                        }}
                      >
                        <Close sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>
                {t("donations.form.category") || "Category"}
              </InputLabel>
              <Select
                value={formData.type}
                label={t("donations.form.category") || "Category"}
                onChange={(e) => onFieldChange("type", e.target.value)}
              >
                <MenuItem value={DonationType.FOOD}>
                  {t("donations.categories.food") || "Food"}
                </MenuItem>
                <MenuItem value={DonationType.CLOTHING}>
                  {t("donations.categories.clothing") || "Clothing"}
                </MenuItem>
                <MenuItem value={DonationType.ELECTRONICS}>
                  {t("donations.categories.electronics") || "Electronics"}
                </MenuItem>
                <MenuItem value={DonationType.FURNITURE}>
                  {t("donations.categories.furniture") || "Furniture"}
                </MenuItem>
                <MenuItem value={DonationType.BOOKS}>
                  {t("donations.categories.books") || "Books"}
                </MenuItem>
                <MenuItem value={DonationType.TOYS}>
                  {t("donations.categories.toys") || "Toys"}
                </MenuItem>
                <MenuItem value={DonationType.OTHER}>
                  {t("donations.categories.other") || "Other"}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="number"
              label={t("donations.form.quantity") || "Quantity"}
              value={formData.quantity}
              onChange={(e) =>
                onFieldChange("quantity", parseInt(e.target.value) || 1)
              }
              required
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label={t("donations.form.unit") || "Unit"}
              value={formData.unit}
              onChange={(e) => onFieldChange("unit", e.target.value)}
              required
              placeholder="e.g., kg, items"
            />
          </Grid>

          {/* Pickup Location */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle2"
              color="primary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              {t("donations.form.pickupLocation") || "Pickup Location"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <AddressAutocomplete
              type="city"
              value={formData.pickupLocation.city}
              onChange={(value) =>
                onNestedFieldChange("pickupLocation", "city", value)
              }
              label={t("donations.form.city") || "City"}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <AddressAutocomplete
              type="street"
              value={formData.pickupLocation.address}
              onChange={(value) =>
                onNestedFieldChange("pickupLocation", "address", value)
              }
              label={t("donations.form.address") || "Street Address"}
              cityContext={formData.pickupLocation.city}
              required
            />
          </Grid>

          {/* Additional Details */}
          <Grid item xs={12}>
            <Typography
              variant="subtitle2"
              color="primary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              {t("donations.form.additionalDetails") || "Additional Details (Optional)"}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label={t("donations.form.expiryDate") || "Expiry Date"}
              value={formData.expiryDate || ""}
              onChange={(e) => onFieldChange("expiryDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t("donations.form.notes") || "Additional Notes"}
              value={formData.notes || ""}
              onChange={(e) => onFieldChange("notes", e.target.value)}
              placeholder={t("donations.form.notesPlaceholder") || "Any special instructions or information"}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel") || "Cancel"}</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={isCreating}
          sx={{
            background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
          }}
        >
          {isCreating
            ? t("common.creating") || "Creating..."
            : t("common.create") || "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDonationModal;
