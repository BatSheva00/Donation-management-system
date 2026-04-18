import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios";
import { Donation, DonationResponse, DonationFilters, DonationStatus } from "../types/donation.types";

export const useDonations = () => {
  const [filters, setFilters] = useState<DonationFilters>({
    status: DonationStatus.PENDING, // Default to pending donations
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data, isLoading, error, refetch } = useQuery<DonationResponse>({
    queryKey: ["donations", filters],
    queryFn: async () => {
      const response = await api.get("/donations", { params: filters });
      return response.data;
    },
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnMount: 'always', // Always refetch when component mounts
    staleTime: 0, // Data is immediately considered stale
  });

  const handleFilterChange = (key: keyof DonationFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when filters change (except pagination)
      ...(key !== "page" && key !== "limit" ? { page: 1 } : {}),
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  return {
    donations: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    filters,
    handleFilterChange,
    handlePageChange,
    refetch,
  };
};

