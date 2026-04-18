import mongoose, { Schema, Document } from "mongoose";

export enum ActivityType {
  DONATION_CREATED = "donation_created",
  DONATION_REQUESTED = "donation_requested",
  DONATION_APPROVED = "donation_approved",
  DONATION_REJECTED = "donation_rejected",
  DONATION_DELIVERED = "donation_delivered",
  DONATION_COMPLETED = "donation_completed",
  DRIVER_ASSIGNED = "driver_assigned",
  DRIVER_IN_TRANSIT = "driver_in_transit",
  REQUEST_CREATED = "request_created",
  REQUEST_MATCHED = "request_matched",
  REQUEST_COMPLETED = "request_completed",
  PROFILE_COMPLETED = "profile_completed",
  PROFILE_VERIFIED = "profile_verified",
  RATING_GIVEN = "rating_given",
  RATING_RECEIVED = "rating_received",
}

export interface IActivity extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: {
    donationId?: string;
    donationTitle?: string;
    requestId?: string;
    requestTitle?: string;
    recipientId?: string;
    recipientName?: string;
    driverId?: string;
    driverName?: string;
    location?: string;
    amount?: number;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying activities by user and date
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ type: 1, createdAt: -1 });
ActivitySchema.index({ createdAt: -1 });

export const Activity = mongoose.model<IActivity>("Activity", ActivitySchema);


