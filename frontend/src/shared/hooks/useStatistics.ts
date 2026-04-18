import { useState, useEffect } from "react";
import {
  statisticsService,
  SystemStats,
  UserStats,
} from "../services/statisticsService";

/**
 * Hook for fetching system-wide statistics
 */
export const useSystemStats = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statisticsService.getSystemStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch statistics");
      console.error("Failed to fetch system stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};

/**
 * Hook for fetching current user's statistics
 */
export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statisticsService.getUserStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch statistics");
      console.error("Failed to fetch user stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};






