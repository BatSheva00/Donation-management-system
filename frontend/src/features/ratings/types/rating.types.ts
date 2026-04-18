export enum RatingType {
  DRIVER_RATING = "driver_rating",
  DONOR_RATING = "donor_rating",
}

export interface Rating {
  _id: string;
  donationId: {
    _id: string;
    title: string;
  };
  raterId: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  ratedUserId: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  type: RatingType;
  value: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingDto {
  donationId: string;
  type: RatingType;
  value: number;
  comment?: string;
}

export interface PendingRating {
  donationId: string;
  donationTitle: string;
  type: RatingType;
  userToRate: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  completedAt: string;
}

export interface CanRateResult {
  canRateDriver: boolean;
  canRateDonor: boolean;
  driverToRate?: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  donorToRate?: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  existingDriverRating?: Rating;
  existingDonorRating?: Rating;
  reason?: string;
}

export interface RatingStats {
  driverRating: number;
  driverRatingCount: number;
  donorRating: number;
  donorRatingCount: number;
}

export interface RatingsResponse {
  success: boolean;
  data: Rating[];
  pagination?: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface PendingRatingsResponse {
  success: boolean;
  data: PendingRating[];
}

export interface CanRateResponse {
  success: boolean;
  data: CanRateResult;
}

export interface RatingStatsResponse {
  success: boolean;
  data: RatingStats;
}
