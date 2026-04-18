/**
 * Donation Notification Helpers
 * Send notifications to donor, receiver, and driver on status changes
 */

import { createNotification } from "../notifications/notification.service";
import { logger } from "../../config/logger";

interface DonationNotificationData {
  donationId: string;
  donationTitle: string;
  donorId: string;
  receiverId?: string;
  driverId?: string;
  oldStatus: string;
  newStatus: string;
}

/**
 * Map donation status to notification type
 */
const getNotificationTypeForStatus = (status: string): string => {
  const typeMap: Record<string, string> = {
    pending: "donation_created",
    requested: "donation_requested",
    approved: "donation_approved",
    rejected: "donation_rejected",
    waiting_for_delivery: "driver_assigned",
    in_transit: "donation_in_transit",
    delivered: "donation_delivered",
    completed: "donation_completed",
  };
  
  return typeMap[status] || "other";
};

/**
 * Notify all relevant parties (donor, receiver, driver) about donation status change
 */
export const notifyDonationStatusChange = async (data: DonationNotificationData): Promise<void> => {
  try {
    const { donationId, donationTitle, donorId, receiverId, driverId, oldStatus, newStatus } = data;
    
    const statusMessages: Record<string, string> = {
      pending: "Pending review",
      requested: "Requested by a user",
      approved: "Approved and ready",
      waiting_for_delivery: "Waiting for delivery",
      in_transit: "In transit",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };

    const newStatusMessage = statusMessages[newStatus] || newStatus;
    const notificationType = getNotificationTypeForStatus(newStatus);

    // Notify donor
    await createNotification({
      userId: donorId,
      type: notificationType,
      title: "Donation Status Updated",
      message: `Your donation "${donationTitle}" status changed to: ${newStatusMessage}`,
      data: {
        donationId,
        oldStatus,
        newStatus,
      },
    });

    // Notify receiver if exists
    if (receiverId) {
      await createNotification({
        userId: receiverId,
        type: notificationType,
        title: "Donation Status Updated",
        message: `The donation "${donationTitle}" you requested status changed to: ${newStatusMessage}`,
        data: {
          donationId,
          oldStatus,
          newStatus,
        },
      });
    }

    // Notify driver if exists
    if (driverId) {
      await createNotification({
        userId: driverId,
        type: notificationType,
        title: "Delivery Status Updated",
        message: `The delivery for "${donationTitle}" status changed to: ${newStatusMessage}`,
        data: {
          donationId,
          oldStatus,
          newStatus,
        },
      });
    }

    logger.debug(`Notifications sent for donation ${donationId} status change: ${oldStatus} → ${newStatus}`);
  } catch (error) {
    logger.error("Error sending donation status change notifications:", error);
  }
};


