import { Button, CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../../lib/axios";
import { CheckCircle } from "@mui/icons-material";

interface CompleteButtonProps {
  donationId: string;
}

export const CompleteButton = ({ donationId }: CompleteButtonProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/donations/${donationId}/mark-completed`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["donation", donationId] });
      toast.success(data.message || "Donation marked as completed. Thank you!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to mark as completed");
    },
  });

  const handleClick = () => {
    if (
      window.confirm(
        "Confirm that you have received this donation?\n\nThis will mark the donation as completed."
      )
    ) {
      mutation.mutate();
    }
  };

  return (
    <Button
      variant="contained"
      color="success"
      onClick={handleClick}
      disabled={mutation.isPending}
      startIcon={<CheckCircle />}
      sx={{ minWidth: 160 }}
    >
      {mutation.isPending ? (
        <CircularProgress size={20} color="inherit" />
      ) : (
        t("donations.markCompleted") || "Mark as Completed"
      )}
    </Button>
  );
};


