import api from "../../../lib/axios";
import {
  CreateRatingDto,
  RatingsResponse,
  PendingRatingsResponse,
  CanRateResponse,
  RatingStatsResponse,
  RatingType,
} from "../types/rating.types";

export const ratingApi = {
  /**
   * Create a new rating
   */
  createRating: async (data: CreateRatingDto) => {
    const response = await api.post("/ratings", data);
    return response.data;
  },

  /**
   * Get ratings for a specific user
   */
  getRatingsByUser: async (
    userId: string,
    options?: { type?: RatingType; page?: number; limit?: number }
  ): Promise<RatingsResponse> => {
    const params = new URLSearchParams();
    if (options?.type) params.append("type", options.type);
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const response = await api.get(
      `/ratings/user/${userId}${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  },

  /**
   * Get ratings for a specific donation
   */
  getRatingsForDonation: async (donationId: string): Promise<RatingsResponse> => {
    const response = await api.get(`/ratings/donation/${donationId}`);
    return response.data;
  },

  /**
   * Get pending ratings for current user
   */
  getPendingRatings: async (): Promise<PendingRatingsResponse> => {
    const response = await api.get("/ratings/pending");
    return response.data;
  },

  /**
   * Check if current user can rate a specific donation
   */
  canRate: async (donationId: string): Promise<CanRateResponse> => {
    const response = await api.get(`/ratings/can-rate/${donationId}`);
    return response.data;
  },

  /**
   * Get rating statistics for a user
   */
  getRatingStats: async (userId: string): Promise<RatingStatsResponse> => {
    const response = await api.get(`/ratings/stats/${userId}`);
    return response.data;
  },
};
