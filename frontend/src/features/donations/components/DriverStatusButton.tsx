import { Button, CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../../lib/axios";
import { LocalShipping } from "@mui/icons-material";

interface DriverStatusButtonProps {
  donationId: string;
  label: string;
  endpoint: string; // 'mark-in-transit' or 'mark-delivered'
}

export const DriverStatusButton = ({
  donationId,
  label,
  endpoint,
}: DriverStatusButtonProps) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/donations/${donationId}/${endpoint}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["donation", donationId] });
      queryClient.invalidateQueries({ queryKey: ["available-deliveries"] });
      toast.success(data.message || "Status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const handleClick = () => {
    const confirmMessage =
      endpoint === "mark-in-transit"
        ? "Mark this donation as in transit?"
        : "Mark this donation as delivered?";

    if (window.confirm(confirmMessage)) {
      mutation.mutate();
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleClick}
      disabled={mutation.isPending}
      startIcon={<LocalShipping />}
      sx={{ minWidth: 160 }}
    >
      {mutation.isPending ? <CircularProgress size={20} color="inherit" /> : label}
    </Button>
  );
};


