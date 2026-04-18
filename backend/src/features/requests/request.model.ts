import mongoose, { Document, Schema } from "mongoose";
import { RequestStatus } from "../../shared/types/enums";

export interface IRequest extends Document {
  _id: string;
  title: string;
  description: string;
  category: string;
  quantity?: number;
  urgency: "low" | "medium" | "high";
  requesterId: mongoose.Types.ObjectId;
  needsDelivery: boolean;
  deliveryAddress?: {
    street: string;
    city: string;
  };
  status: RequestStatus;
  fulfilledBy?: mongoose.Types.ObjectId;
  assignedDriverId?: mongoose.Types.ObjectId;
  notes?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "food",
        "clothing",
        "furniture",
        "electronics",
        "books",
        "toys",
        "medical",
        "other",
      ],
    },
    quantity: {
      type: Number,
      min: 1,
    },
    urgency: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    needsDelivery: {
      type: Boolean,
      default: false,
    },
    deliveryAddress: {
      street: String,
      city: String,
    },
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.PENDING,
      index: true,
    },
    fulfilledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    assignedDriverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
RequestSchema.index({ status: 1, createdAt: -1 });
RequestSchema.index({ requesterId: 1, status: 1 });
RequestSchema.index({ fulfilledBy: 1, status: 1 });
RequestSchema.index({ assignedDriverId: 1, status: 1 });

export const Request = mongoose.model<IRequest>("Request", RequestSchema);
