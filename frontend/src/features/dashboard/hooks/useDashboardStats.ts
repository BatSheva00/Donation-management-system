import { useTranslation } from "react-i18next";
import { alpha } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Favorite, People, LocalShipping, Star } from "@mui/icons-material";
import { useUserStats } from "../../../shared/hooks/useStatistics";
import { formatNumber } from "../../../shared/utils/formatNumber";

interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export const useDashboardStats = () => {
  const { t } = useTranslation();
  const { stats: userStats, loading, error } = useUserStats();

  // Build stats from real data
  const stats: StatItem[] = userStats
    ? [
        {
          title: t("dashboard.totalDonations"),
          value: formatNumber(userStats.totalDonationsMade),
          change: userStats.monthlyDonations > 0 ? `+${userStats.monthlyDonations} ${t("dashboard.thisMonth")}` : "",
          icon: React.createElement(Favorite),
          color: "#359364",
          bgColor: alpha("#359364", 0.1),
        },
        {
          title: t("dashboard.activeRequests"),
          value: formatNumber(userStats.totalRequestsMade),
          change: "",
          icon: React.createElement(People),
          color: "#f97316",
          bgColor: alpha("#f97316", 0.1),
        },
        {
          title: t("dashboard.deliveries"),
          value: formatNumber(userStats.totalDeliveries),
          change: userStats.monthlyDeliveries > 0 ? `+${userStats.monthlyDeliveries} ${t("dashboard.thisMonth")}` : "",
          icon: React.createElement(LocalShipping),
          color: "#3b82f6",
          bgColor: alpha("#3b82f6", 0.1),
        },
        {
          title: t("dashboard.peopleHelped"),
          value: formatNumber(userStats.totalPeopleHelped),
          change: userStats.monthlyPeopleHelped > 0 ? `+${userStats.monthlyPeopleHelped} ${t("dashboard.thisMonth")}` : "",
          icon: React.createElement(Star),
          color: "#f59e0b",
          bgColor: alpha("#f59e0b", 0.1),
        },
      ]
    : [
        {
          title: t("dashboard.totalDonations"),
          value: loading ? "..." : "0",
          change: "",
          icon: React.createElement(Favorite),
          color: "#359364",
          bgColor: alpha("#359364", 0.1),
        },
        {
          title: t("dashboard.activeRequests"),
          value: loading ? "..." : "0",
          change: "",
          icon: React.createElement(People),
          color: "#f97316",
          bgColor: alpha("#f97316", 0.1),
        },
        {
          title: t("dashboard.deliveries"),
          value: loading ? "..." : "0",
          change: "",
          icon: React.createElement(LocalShipping),
          color: "#3b82f6",
          bgColor: alpha("#3b82f6", 0.1),
        },
        {
          title: t("dashboard.peopleHelped"),
          value: loading ? "..." : "0",
          change: "",
          icon: React.createElement(Star),
          color: "#f59e0b",
          bgColor: alpha("#f59e0b", 0.1),
        },
      ];

  const recentActivity = [
    {
      title: t("common.welcome"),
      description: t("dashboard.startJourney"),
      time: t("dashboard.justNow"),
      type: "info",
    },
  ];

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "#dc2626",
      business: "#7c3aed",
      driver: "#2563eb",
      packer: "#059669",
      user: "#0891b2",
    };
    return colors[role] || "#6b7280";
  };

  return {
    stats,
    userStats,
    loading,
    error,
    recentActivity,
    getRoleBadgeColor,
  };
};
