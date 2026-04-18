export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  BUSINESS = 'business',
  DRIVER = 'driver',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  EMAIL_VERIFICATION = 'email_verification',
}

export enum ProfileCompletionStatus {
  INCOMPLETE = 'incomplete',
  PENDING_REVIEW = 'pending_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum DonationType {
  FOOD = 'food',
  CLOTHING = 'clothing',
  ELECTRONICS = 'electronics',
  FURNITURE = 'furniture',
  BOOKS = 'books',
  TOYS = 'toys',
  OTHER = 'other',
}

export enum DonationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REQUESTED = 'requested',
  WAITING_FOR_DELIVERY = 'waiting_for_delivery',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  FULFILLED = 'fulfilled',
  WAITING_FOR_DELIVERY = 'waiting_for_delivery',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum DriverStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum NotificationType {
  DONATION_CREATED = 'donation_created',
  DONATION_APPROVED = 'donation_approved',
  DONATION_REQUESTED = 'donation_requested',
  DONATION_REJECTED = 'donation_rejected',
  DONATION_ASSIGNED = 'donation_assigned',
  DONATION_IN_TRANSIT = 'donation_in_transit',
  DONATION_DELIVERED = 'donation_delivered',
  DONATION_COMPLETED = 'donation_completed',
  REQUEST_CREATED = 'request_created',
  REQUEST_APPROVED = 'request_approved',
  REQUEST_REJECTED = 'request_rejected',
  REQUEST_FULFILLED = 'request_fulfilled',
  REQUEST_ASSIGNED = 'request_assigned',
  REQUEST_IN_TRANSIT = 'request_in_transit',
  REQUEST_DELIVERED = 'request_delivered',
  REQUEST_COMPLETED = 'request_completed',
  DRIVER_ASSIGNED = 'driver_assigned',
  PAYMENT_COMPLETED = 'payment_completed',
  SYSTEM_NOTIFICATION = 'system_notification',
  RATING_REQUESTED = 'rating_requested',
  RATING_RECEIVED = 'rating_received',
}


