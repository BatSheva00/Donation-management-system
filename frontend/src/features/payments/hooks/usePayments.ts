import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import { Transaction, SystemBalance } from "../types/payment.types";

export const useMyDonations = (page = 1, limit = 20) => {
  return useQuery<{
    success: boolean;
    data: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>({
    queryKey: ["myDonations", page, limit],
    queryFn: async () => {
      const response = await api.get("/payments/my-donations", {
        params: { page, limit },
      });
      return response.data;
    },
  });
};

export const useCreateDonationIntent = () => {
  return useMutation({
    mutationFn: async (amount: number) => {
      const response = await api.post("/payments/create-donation-intent", {
        amount,
      });
      return response.data;
    },
  });
};

export const useConfirmDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentIntentId: string) => {
      const response = await api.post("/payments/confirm-donation", {
        paymentIntentId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myDonations"] });
      queryClient.invalidateQueries({ queryKey: ["systemBalance"] });
    },
  });
};

export const useSystemBalance = () => {
  return useQuery<{ success: boolean; data: SystemBalance }>({
    queryKey: ["systemBalance"],
    queryFn: async () => {
      const response = await api.get("/payments/system-balance");
      return response.data;
    },
    refetchOnWindowFocus: true,
  });
};
