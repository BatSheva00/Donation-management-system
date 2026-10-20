import { DonationStatus } from "../../shared/types/enums";

export const GUEST_VISIBLE_STATUSES = [
  DonationStatus.PENDING,
  DonationStatus.APPROVED,
];

const PUBLIC_DONOR_FIELDS = "firstName lastName profileImage profileCompletionStatus donorRating donorRatingCount";

export const guestListPopulate = PUBLIC_DONOR_FIELDS;

export function isGuestRequest(req: { user?: { userId?: string } }): boolean {
  return !req.user?.userId;
}

export function sanitizeDonationForGuest<T extends Record<string, unknown>>(
  donation: T
): T {
  const copy = JSON.parse(JSON.stringify(donation)) as T & {
    notes?: unknown;
    pickupLocation?: { address?: string; city?: string; coordinates?: unknown };
    donorId?: Record<string, unknown>;
    requestedBy?: unknown;
    assignedDriverId?: unknown;
    assignedPackerId?: unknown;
    requestId?: unknown;
    guestPreview?: boolean;
  };

  delete copy.notes;
  delete copy.requestedBy;
  delete copy.assignedDriverId;
  delete copy.assignedPackerId;
  delete copy.requestId;

  if (copy.pickupLocation) {
    copy.pickupLocation = {
      city: copy.pickupLocation.city,
    } as typeof copy.pickupLocation;
  }

  if (copy.donorId && typeof copy.donorId === "object") {
    copy.donorId = {
      _id: copy.donorId._id,
      firstName: copy.donorId.firstName,
      lastName: copy.donorId.lastName,
      profileImage: copy.donorId.profileImage,
      profileCompletionStatus: copy.donorId.profileCompletionStatus,
      donorRating: copy.donorId.donorRating,
      donorRatingCount: copy.donorId.donorRatingCount,
    };
  }

  copy.guestPreview = true;
  return copy;
}
