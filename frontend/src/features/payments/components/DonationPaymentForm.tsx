import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button, Box, Alert, CircularProgress } from "@mui/material";
import { useConfirmDonation } from "../hooks/usePayments";

interface DonationPaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const DonationPaymentForm = ({
  amount,
  onSuccess,
  onError,
}: DonationPaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const confirmDonation = useConfirmDonation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage("");
    onError("");

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setMessage(error.message || "Payment failed");
        onError(error.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm with backend
        try {
          await confirmDonation.mutateAsync(paymentIntent.id);
          setMessage("Thank you for your donation!");
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } catch (backendError: any) {
          setMessage(
            backendError.response?.data?.message ||
              "Payment succeeded but failed to record. Please contact support."
          );
          onError("Failed to record donation");
        }
      }
    } catch (err: any) {
      setMessage(err.message || "An unexpected error occurred");
      onError(err.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ my: 3 }}>
        <PaymentElement />
      </Box>

      {message && (
        <Alert
          severity={message.includes("Thank you") ? "success" : "error"}
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || isProcessing}
        sx={{ mt: 2 }}
      >
        {isProcessing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          `Donate $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};




