import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  Favorite,
  People,
  LocalShipping,
  TrendingUp,
  Security,
  Public,
  Restaurant,
  Checkroom,
  Devices,
} from "@mui/icons-material";
import { useAuthStore } from "../../shared/stores/authStore";
import { useSystemStats } from "../../shared/hooks/useStatistics";
import { formatNumberCompact } from "../../shared/utils/formatNumber";
import {
  HeroSection,
  StatsSection,
  FeaturesSection,
  CategoriesSection,
  WhyChooseUsSection,
  CTASection,
} from "./components";

const HomePage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { stats: systemStats, loading: statsLoading } = useSystemStats();

  const features = [
    {
      icon: <Favorite sx={{ fontSize: 48 }} />,
      title: t("home.donate"),
      description: t("home.donateDesc"),
      color: "#359364",
    },
    {
      icon: <People sx={{ fontSize: 48 }} />,
      title: t("home.request"),
      description: t("home.requestDesc"),
      color: "#f97316",
    },
    {
      icon: <LocalShipping sx={{ fontSize: 48 }} />,
      title: t("home.deliver"),
      description: t("home.deliverDesc"),
      color: "#3b82f6",
    },
  ];

  // Use real stats from API or fallback to loading state
  const stats = systemStats
    ? [
        {
          value: formatNumberCompact(systemStats.totalDonations),
          label: t("home.stats.donations"),
        },
        {
          value: formatNumberCompact(systemStats.totalUsers),
          label: t("home.stats.activeUsers"),
        },
        {
          value: formatNumberCompact(systemStats.totalDrivers),
          label: t("home.stats.volunteers"),
        },
        {
          value: formatNumberCompact(systemStats.totalBusinesses),
          label: t("home.stats.businesses"),
        },
      ]
    : [
        { value: statsLoading ? "..." : "0", label: t("home.stats.donations") },
        { value: statsLoading ? "..." : "0", label: t("home.stats.activeUsers") },
        { value: statsLoading ? "..." : "0", label: t("home.stats.volunteers") },
        { value: statsLoading ? "..." : "0", label: t("home.stats.businesses") },
      ];

  const categories = [
    { icon: <Restaurant />, name: t("home.categories.food"), color: "#10b981" },
    {
      icon: <Checkroom />,
      name: t("home.categories.clothing"),
      color: "#8b5cf6",
    },
    {
      icon: <Devices />,
      name: t("home.categories.electronics"),
      color: "#f59e0b",
    },
  ];

  const whyItems = [
    {
      icon: <TrendingUp />,
      title: t("home.why.impact"),
      desc: t("home.why.impactDesc"),
    },
    {
      icon: <Security />,
      title: t("home.why.secure"),
      desc: t("home.why.secureDesc"),
    },
    {
      icon: <Public />,
      title: t("home.why.global"),
      desc: t("home.why.globalDesc"),
    },
  ];

  return (
    <Box>
      <HeroSection isAuthenticated={isAuthenticated} t={t} />
      <StatsSection stats={stats} />
      <FeaturesSection features={features} t={t} />
      <CategoriesSection categories={categories} t={t} />
      <WhyChooseUsSection items={whyItems} t={t} />
      <CTASection t={t} />
    </Box>
  );
};

export default HomePage;
