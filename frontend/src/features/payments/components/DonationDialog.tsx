import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { DonationPaymentForm } from "./DonationPaymentForm";
import { useAuthStore } from "../../../shared/stores/authStore";

// Load Stripe with publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error(
    "❌ VITE_STRIPE_PUBLISHABLE_KEY is not set in frontend/.env file"
  );
}

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

interface DonationDialogProps {
  open: boolean;
  onClose: () => void;
}

export const DonationDialog = ({ open, onClose }: DonationDialogProps) => {
  const { accessToken } = useAuthStore();
  const [amount, setAmount] = useState<string>("10");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<"amount" | "payment">("amount");

  const handleAmountSubmit = async () => {
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount < 1) {
      setError("Please enter an amount of at least $1");
      return;
    }

    try {
      setError("");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/create-donation-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ amount: numAmount }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create payment intent");
      }

      setClientSecret(data.data.clientSecret);
      setStep("payment");
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment");
    }
  };

  const handleSuccess = () => {
    setStep("amount");
    setAmount("10");
    setClientSecret("");
    setError("");
    onClose();
  };

  const handleBack = () => {
    setStep("amount");
    setClientSecret("");
    setError("");
  };

  const handleClose = () => {
    setStep("amount");
    setAmount("10");
    setClientSecret("");
    setError("");
    onClose();
  };

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
    },
    // Only show card, Apple Pay, and Google Pay
    paymentMethodOrder: ["card", "apple_pay", "google_pay"],
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {step === "amount" ? "Donate to KindLoop" : "Complete Your Donation"}
      </DialogTitle>

      <DialogContent>
        {step === "amount" ? (
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Your donation helps us connect people who want to give with those
              who need. Thank you for supporting our mission!
            </Typography>

            <TextField
              fullWidth
              label="Donation Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              inputProps={{
                min: 1,
                step: 0.01,
              }}
              sx={{ mt: 3 }}
              autoFocus
            />

            <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {[5, 10, 25, 50, 100].map((preset) => (
                <Button
                  key={preset}
                  variant="outlined"
                  size="small"
                  onClick={() => setAmount(preset.toString())}
                  sx={{ flex: "1 1 auto" }}
                >
                  ${preset}
                </Button>
              ))}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        ) : (
          <Box sx={{ py: 2 }}>
            <Typography
              variant="h6"
              color="primary"
              gutterBottom
              textAlign="center"
            >
              ${parseFloat(amount).toFixed(2)}
            </Typography>

            {!stripePromise ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                Stripe is not configured. Please contact the administrator.
              </Alert>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={options}>
                <DonationPaymentForm
                  amount={parseFloat(amount)}
                  onSuccess={handleSuccess}
                  onError={setError}
                />
              </Elements>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {step === "amount" ? (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAmountSubmit}
              disabled={!amount || parseFloat(amount) < 1}
            >
              Continue
            </Button>
          </>
        ) : (
          <Button onClick={handleBack}>Back</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
