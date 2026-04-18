export enum RequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  FULFILLED = "fulfilled",
  WAITING_FOR_DELIVERY = "waiting_for_delivery",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}

export interface IRequest {
  _id: string;
  title: string;
  description: string;
  category: string;
  quantity?: number;
  urgency: "low" | "medium" | "high";
  requesterId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileCompletionStatus?: string;
  };
  needsDelivery: boolean;
  deliveryAddress?: {
    street: string;
    city: string;
  };
  status: RequestStatus;
  fulfilledBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileCompletionStatus?: string;
  };
  assignedDriverId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileCompletionStatus?: string;
    driverInfo?: any;
  };
  notes?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestDto {
  title: string;
  description: string;
  category: string;
  quantity?: number;
  urgency: "low" | "medium" | "high";
  needsDelivery: boolean;
  deliveryAddress?: {
    street: string;
    city: string;
  };
  notes?: string;
  expiresAt?: string;
}

export interface RequestFilters {
  status?: RequestStatus;
  category?: string;
  urgency?: string;
  needsDelivery?: boolean;
  page?: number;
  limit?: number;
}
