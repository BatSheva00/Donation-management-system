import { createActivity } from "./activity.service";
import { ActivityType } from "./activity.model";
import { Activity } from "./activity.model";

/**
 * Helper function to update or create a donation activity for a user
 */
const updateOrCreateDonationActivity = async (
  userId: string,
  donationId: string,
  type: ActivityType,
  title: string,
  description: string,
  metadata: Record<string, any>
) => {
  // Try to find existing activity for this user-donation pair
  const existingActivity = await Activity.findOne({
    userId,
    "metadata.donationId": donationId,
  });

  if (existingActivity) {
    // Update existing activity
    existingActivity.type = type;
    existingActivity.title = title;
    existingActivity.description = description;
    existingActivity.metadata = { ...existingActivity.metadata, ...metadata };
    existingActivity.createdAt = new Date(); // Update timestamp to reflect latest change
    await existingActivity.save();
  } else {
    // Create new activity
    await createActivity({
      userId,
      type,
      title,
      description,
      metadata: {
        ...metadata,
        donationId,
      },
    });
  }
};

/**
 * Track donation created activity (for donor)
 */
export const trackDonationCreated = async (
  userId: string,
  donationId: string,
  donationTitle: string
) => {
  await updateOrCreateDonationActivity(
    userId,
    donationId,
    ActivityType.DONATION_CREATED,
    "Created a donation",
    `Created donation: "${donationTitle}"`,
    { donationTitle, status: "pending" }
  );
};

/**
 * Track donation requested activity (for receiver)
 */
export const trackDonationRequested = async (
  userId: string,
  donationId: string,
  donationTitle: string,
  needsDelivery: boolean
) => {
  await updateOrCreateDonationActivity(
    userId,
    donationId,
    ActivityType.DONATION_REQUESTED,
    "Requested a donation",
    `Requested donation: "${donationTitle}"${needsDelivery ? " with delivery" : ""}`,
    { donationTitle, needsDelivery, status: "requested" }
  );
};

/**
 * Track donation approved activity (for requester)
 */
export const trackDonationApproved = async (
  userId: string,
  donationId: string,
  donationTitle: string
) => {
  await updateOrCreateDonationActivity(
    userId,
    donationId,
    ActivityType.DONATION_APPROVED,
    "Donation request approved",
    `Your request for "${donationTitle}" was approved`,
    { donationTitle, status: "approved" }
  );
};

/**
 * Track donation rejected activity (for requester)
 */
export const trackDonationRejected = async (
  userId: string,
  donationId: string,
  donationTitle: string,
  reason?: string
) => {
  await updateOrCreateDonationActivity(
    userId,
    donationId,
    ActivityType.DONATION_REJECTED,
    "Donation request rejected",
    `Your request for "${donationTitle}" was rejected${reason ? `: ${reason}` : ""}`,
    { donationTitle, reason, status: "rejected" }
  );
};

/**
 * Track driver assignment activity (for driver)
 */
export const trackDriverAssigned = async (
  driverId: string,
  donationId: string,
  donationTitle: string,
  deliveryCity: string
) => {
  await updateOrCreateDonationActivity(
    driverId,
    donationId,
    ActivityType.DRIVER_ASSIGNED,
    "Assigned to delivery",
    `Assigned to deliver "${donationTitle}" to ${deliveryCity}`,
    { donationTitle, location: deliveryCity, status: "assigned" }
  );
};

/**
 * Track driver marked in transit activity (for driver)
 */
export const trackDriverInTransit = async (
  driverId: string,
  donationId: string,
  donationTitle: string
) => {
  await updateOrCreateDonationActivity(
    driverId,
    donationId,
    ActivityType.DRIVER_IN_TRANSIT,
    "Delivery in transit",
    `Started delivering "${donationTitle}"`,
    { donationTitle, status: "in_transit" }
  );
};

/**
 * Track delivery completed activity (for driver)
 */
export const trackDonationDelivered = async (
  driverId: string,
  donationId: string,
  donationTitle: string
) => {
  await updateOrCreateDonationActivity(
    driverId,
    donationId,
    ActivityType.DONATION_DELIVERED,
    "Delivery completed",
    `Delivered donation: "${donationTitle}"`,
    { donationTitle, status: "delivered" }
  );
};

/**
 * Track donation completion activity (for requester)
 */
export const trackDonationCompleted = async (
  userId: string,
  donationId: string,
  donationTitle: string
) => {
  await updateOrCreateDonationActivity(
    userId,
    donationId,
    ActivityType.DONATION_COMPLETED,
    "Donation received",
    `Confirmed receipt of "${donationTitle}"`,
    { donationTitle, status: "completed" }
  );
};


