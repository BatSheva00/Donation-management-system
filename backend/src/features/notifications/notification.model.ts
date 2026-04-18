import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "donation_created",
        "donation_requested",
        "donation_approved",
        "donation_rejected",
        "donation_completed",
        "driver_assigned",
        "donation_in_transit",
        "donation_delivered",
        "request_created",
        "request_approved",
        "request_rejected",
        "request_fulfilled",
        "request_assigned",
        "request_in_transit",
        "request_delivered",
        "request_completed",
        "profile_completion",
        "system",
        "other",
        "rating_requested",
        "rating_received",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
