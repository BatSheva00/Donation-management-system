export enum DonationType {
  FOOD = "food",
  CLOTHING = "clothing",
  ELECTRONICS = "electronics",
  FURNITURE = "furniture",
  BOOKS = "books",
  TOYS = "toys",
  OTHER = "other",
}

export enum DonationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REQUESTED = "requested",
  WAITING_FOR_DELIVERY = "waiting_for_delivery",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}

export interface Donation {
  _id: string;
  donorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | { countryCode: string; number: string };
    profileImage?: string;
  };
  title: string;
  description: string;
  type: DonationType;
  quantity: number;
  unit: string;
  images?: string[];
  status: DonationStatus;
  pickupLocation: {
    address: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  pickupTimeWindow?: {
    start: Date;
    end: Date;
  };
  expiryDate?: Date;
  assignedDriverId?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone?: string | { countryCode: string; number: string };
  };
  assignedPackerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone?: string | { countryCode: string; number: string };
  };
  requestedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | { countryCode: string; number: string };
    profileImage?: string;
  };
  requestedAt?: Date;
  deliveryLocation?: {
    address: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  needsDelivery?: boolean;
  notes?: string;
  adminNotes?: string;
  rejectionReason?: string;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDonationDto {
  title: string;
  description: string;
  type: DonationType;
  quantity: number;
  unit: string;
  images?: string[];
  pickupLocation: {
    address: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  pickupTimeWindow?: {
    start: Date | string;
    end: Date | string;
  };
  expiryDate?: Date | string;
  notes?: string;
}

export interface UpdateDonationDto extends Partial<CreateDonationDto> {}

export interface DonationFilters {
  status?: DonationStatus;
  type?: DonationType;
  search?: string;
  isFood?: boolean;
  city?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DonationResponse {
  success: boolean;
  data: Donation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type DonationCategory = "food" | "clothing" | "electronics" | "furniture" | "books" | "toys" | "other";

