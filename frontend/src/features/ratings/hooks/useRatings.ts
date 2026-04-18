import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ratingApi } from "../api/ratingApi";
import { CreateRatingDto, RatingType } from "../types/rating.types";
import { toast } from "react-toastify";

/**
 * Hook to get ratings for a specific user
 */
export const useUserRatings = (
  userId: string | undefined,
  options?: { type?: RatingType; page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: ["ratings", "user", userId, options],
    queryFn: () => ratingApi.getRatingsByUser(userId!, options),
    enabled: !!userId,
  });
};

/**
 * Hook to get ratings for a specific donation
 */
export const useDonationRatings = (donationId: string | undefined) => {
  return useQuery({
    queryKey: ["ratings", "donation", donationId],
    queryFn: () => ratingApi.getRatingsForDonation(donationId!),
    enabled: !!donationId,
  });
};

/**
 * Hook to get pending ratings for current user
 */
export const usePendingRatings = () => {
  return useQuery({
    queryKey: ["ratings", "pending"],
    queryFn: () => ratingApi.getPendingRatings(),
  });
};

/**
 * Hook to check if current user can rate a donation
 */
export const useCanRate = (donationId: string | undefined) => {
  return useQuery({
    queryKey: ["ratings", "can-rate", donationId],
    queryFn: () => ratingApi.canRate(donationId!),
    enabled: !!donationId,
  });
};

/**
 * Hook to get rating stats for a user
 */
export const useRatingStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["ratings", "stats", userId],
    queryFn: () => ratingApi.getRatingStats(userId!),
    enabled: !!userId,
  });
};

/**
 * Hook to create a new rating
 */
export const useCreateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRatingDto) => ratingApi.createRating(data),
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Show success message
      const isDriverRating = variables.type === RatingType.DRIVER_RATING;
      toast.success(
        isDriverRating
          ? "Thank you for rating your driver!"
          : "Thank you for rating the donation!"
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to submit rating"
      );
    },
  });
};
