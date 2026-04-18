import { Box, Typography, Stepper, Step, StepLabel, StepContent, Paper, alpha } from "@mui/material";
import { CheckCircle, Circle, RadioButtonUnchecked } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { DonationStatus } from "../types/donation.types";

interface DonationStatusTimelineProps {
  currentStatus: DonationStatus;
  needsDelivery?: boolean;
}

interface StatusStep {
  status: DonationStatus | string;
  label: string;
  description: string;
  optional?: boolean;
}

export const DonationStatusTimeline = ({
  currentStatus,
  needsDelivery = false,
}: DonationStatusTimelineProps) => {
  const { t } = useTranslation();

  // Define all possible statuses
  const allStatuses: StatusStep[] = [
    {
      status: DonationStatus.PENDING,
      label: t("donations.status.pending") || "Pending",
      description: t("donations.statusDesc.pending") || "Donation created, waiting for request",
    },
    {
      status: DonationStatus.REQUESTED,
      label: t("donations.status.requested") || "Requested",
      description: t("donations.statusDesc.requested") || "User has requested this donation",
    },
    {
      status: DonationStatus.APPROVED,
      label: t("donations.status.approved") || "Approved",
      description: t("donations.statusDesc.approved") || "Request has been approved",
    },
    {
      status: "waiting_for_delivery",
      label: t("donations.status.waitingForDelivery") || "Waiting for Delivery",
      description: t("donations.statusDesc.waitingForDelivery") || "Waiting for driver assignment",
      optional: !needsDelivery,
    },
    {
      status: DonationStatus.IN_TRANSIT,
      label: t("donations.status.inTransit") || "In Transit",
      description: t("donations.statusDesc.inTransit") || "Delivery in progress",
      optional: !needsDelivery,
    },
    {
      status: DonationStatus.DELIVERED,
      label: t("donations.status.delivered") || "Delivered",
      description: t("donations.statusDesc.delivered") || "Donation has been delivered",
      optional: !needsDelivery,
    },
    {
      status: DonationStatus.COMPLETED,
      label: t("donations.status.completed") || "Completed",
      description: t("donations.statusDesc.completed") || "Donation process is complete",
    },
  ];

  // Filter statuses based on delivery requirement
  const relevantStatuses = needsDelivery
    ? allStatuses
    : allStatuses.filter(step => !step.optional);

  // Determine which step is active
  const statusOrder = relevantStatuses.map(step => step.status);
  const currentIndex = statusOrder.indexOf(currentStatus);
  const activeStep = currentIndex === -1 ? 0 : currentIndex;

  // Handle special statuses (rejected, cancelled)
  const isRejected = currentStatus === DonationStatus.REJECTED;
  const isCancelled = currentStatus === DonationStatus.CANCELLED;

  if (isRejected || isCancelled) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: alpha("#f44336", 0.1),
          border: "1px solid",
          borderColor: alpha("#f44336", 0.3),
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          {isRejected ? t("donations.status.rejected") : t("donations.status.cancelled")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isRejected
            ? t("donations.statusDesc.rejected") || "This donation request was rejected"
            : t("donations.statusDesc.cancelled") || "This donation was cancelled"}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: alpha("#359364", 0.02) }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        {t("donations.statusTimeline") || "Donation Progress"}
      </Typography>
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {relevantStatuses.map((step, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;
          const isPending = index > activeStep;

          return (
            <Step key={step.status} completed={isCompleted}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isCompleted
                        ? "#359364"
                        : isActive
                        ? "#359364"
                        : alpha("#000", 0.1),
                      color: "white",
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle sx={{ fontSize: 24, color: "white" }} />
                    ) : isActive ? (
                      <Circle sx={{ fontSize: 12 }} />
                    ) : (
                      <RadioButtonUnchecked sx={{ fontSize: 16, color: alpha("#000", 0.3) }} />
                    )}
                  </Box>
                )}
                sx={{
                  "& .MuiStepLabel-label": {
                    fontWeight: isActive ? 600 : 400,
                    color: isCompleted || isActive ? "#000" : alpha("#000", 0.5),
                  },
                }}
              >
                {step.label}
                {step.optional && (
                  <Typography
                    variant="caption"
                    sx={{ ml: 1, color: alpha("#000", 0.6) }}
                  >
                    (Optional)
                  </Typography>
                )}
              </StepLabel>
              <StepContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {step.description}
                </Typography>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    </Paper>
  );
};




