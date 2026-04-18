import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AddressAutocomplete from "../../../shared/components/forms/AddressAutocomplete";
import { useAuthStore } from "../../../shared/stores/authStore";

interface DeliveryRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (deliveryInfo: {
    needsDelivery: boolean;
    deliveryAddress?: string;
    deliveryCity?: string;
  }) => void;
  loading?: boolean;
  donationTitle: string;
}

export const DeliveryRequestDialog = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  donationTitle,
}: DeliveryRequestDialogProps) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [needsDelivery, setNeedsDelivery] = useState(true);
  const [deliveryCity, setDeliveryCity] = useState(user?.address?.city || "");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address?.street || "");

  const handleConfirm = () => {
    onConfirm({
      needsDelivery,
      deliveryAddress: needsDelivery ? deliveryAddress : undefined,
      deliveryCity: needsDelivery ? deliveryCity : undefined,
    });
  };

  const isValid = !needsDelivery || (deliveryCity && deliveryAddress);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          {t("donations.requestDonation") || "Request Donation"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {donationTitle}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Delivery Option */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={needsDelivery}
                  onChange={(e) => setNeedsDelivery(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {t("donations.needsDelivery") || "I need delivery"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("donations.needsDeliveryDesc") ||
                      "Check this if you need the donation delivered to your address"}
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* Delivery Address Fields */}
          {needsDelivery && (
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="primary">
                {t("donations.deliveryLocation") || "Delivery Location"}
              </Typography>

              <AddressAutocomplete
                type="city"
                value={deliveryCity}
                onChange={setDeliveryCity}
                label={t("donations.form.city") || "City"}
                required
              />

              <AddressAutocomplete
                type="street"
                value={deliveryAddress}
                onChange={setDeliveryAddress}
                label={t("donations.form.address") || "Street Address"}
                cityContext={deliveryCity}
                required
              />

              <Typography variant="caption" color="text.secondary">
                {t("donations.deliveryNote") ||
                  "A driver will be assigned to deliver this donation to your address"}
              </Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {t("common.cancel") || "Cancel"}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!isValid || loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            t("donations.confirmRequest") || "Confirm Request"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


