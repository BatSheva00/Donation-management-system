import api from "../../lib/axios";

export interface SystemStats {
  totalDonations: number;
  totalRequests: number;
  totalCompletedDonations: number;
  uniqueUsersHelped: number;
  totalDrivers: number;
  totalBusinesses: number;
  totalUsers: number;
  lastUpdated: string;
}

export interface UserStats {
  donationsCompleted: number;
  totalDonationsMade: number;
  totalRequestsMade: number;
  totalDeliveries: number;
  totalPeopleHelped: number;
  monthlyPeopleHelped: number;
  monthlyDonations: number;
  monthlyDeliveries: number;
  currentMonth: string;
  lastUpdated: string;
}

export const statisticsService = {
  /**
   * Get system-wide statistics (public)
   */
  getSystemStats: async (): Promise<SystemStats> => {
    const response = await api.get("/statistics/system");
    return response.data.data;
  },

  /**
   * Get current user's statistics (requires auth)
   */
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get("/statistics/me");
    return response.data.data;
  },

  /**
   * Get specific user's statistics (admin only)
   */
  getUserStatsById: async (userId: string): Promise<UserStats> => {
    const response = await api.get(`/statistics/user/${userId}`);
    return response.data.data;
  },
};


