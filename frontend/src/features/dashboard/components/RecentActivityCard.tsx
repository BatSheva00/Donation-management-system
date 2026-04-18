import { Card, CardContent, Box, Typography, Stack, Chip, CircularProgress } from "@mui/material";
import { AccessTime, Favorite, ShoppingBag, LocalShipping, CheckCircle } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import api from "../../../lib/axios";

interface RecentActivityCardProps {
  t: any;
}

interface Activity {
  _id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  metadata?: {
    donationId?: string;
    donationTitle?: string;
    [key: string]: any;
  };
}

const getActivityIcon = (type: string) => {
  if (type.includes("donation_created")) return <Favorite fontSize="small" />;
  if (type.includes("requested")) return <ShoppingBag fontSize="small" />;
  if (type.includes("driver") || type.includes("transit") || type.includes("delivered")) return <LocalShipping fontSize="small" />;
  if (type.includes("completed") || type.includes("approved")) return <CheckCircle fontSize="small" />;
  return <AccessTime fontSize="small" />;
};

const getActivityColor = (type: string) => {
  if (type.includes("created")) return "#359364";
  if (type.includes("requested")) return "#f97316";
  if (type.includes("driver") || type.includes("transit")) return "#3b82f6";
  if (type.includes("delivered")) return "#8b5cf6";
  if (type.includes("completed") || type.includes("approved")) return "#10b981";
  if (type.includes("rejected")) return "#ef4444";
  return "#6b7280";
};

const translateActivityTitle = (type: string, t: any): string => {
  const translations: { [key: string]: string } = {
    donation_created: t("activities.donationCreated") || "Created a donation",
    donation_requested: t("activities.donationRequested") || "Requested a donation",
    donation_approved: t("activities.donationApproved") || "Donation request approved",
    donation_rejected: t("activities.donationRejected") || "Donation request rejected",
    donation_delivered: t("activities.donationDelivered") || "Delivery completed",
    donation_completed: t("activities.donationCompleted") || "Donation received",
    driver_assigned: t("activities.driverAssigned") || "Assigned to delivery",
    driver_in_transit: t("activities.driverInTransit") || "Delivery in transit",
  };
  return translations[type] || type;
};

export const RecentActivityCard = ({ t }: RecentActivityCardProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const response = await api.get("/activities/recent?limit=10");
      return response.data.data;
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: "always",
  });

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <AccessTime color="primary" />
          <Typography variant="h6" component="h2" fontWeight={600}>
            {t("dashboard.recentActivity")}
          </Typography>
        </Box>

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {!isLoading && (!activities || activities.length === 0) && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.noActivity")}
            </Typography>
          </Box>
        )}

        {!isLoading && activities && activities.length > 0 && (
          <Stack spacing={2}>
            {activities.map((activity) => (
              <Box
                key={activity._id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: getActivityColor(activity.type),
                    bgcolor: `${getActivityColor(activity.type)}08`,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Box
                    sx={{
                      mt: 0.5,
                      color: getActivityColor(activity.type),
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: getActivityColor(activity.type) }}
                    >
                      {translateActivityTitle(activity.type, t)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {activity.metadata?.donationTitle || activity.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      {formatDistanceToNow(new Date(activity.createdAt), { 
                        addSuffix: true,
                        locale: isRTL ? he : undefined,
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
