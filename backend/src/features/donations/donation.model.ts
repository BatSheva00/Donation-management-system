import mongoose, { Schema, Document } from "mongoose";
import { DonationType, DonationStatus } from "../../shared/types/enums";

export interface IDonation extends Document {
  _id: string;
  donorId: mongoose.Types.ObjectId;
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
  assignedDriverId?: mongoose.Types.ObjectId;
  assignedPackerId?: mongoose.Types.ObjectId;
  requestId?: mongoose.Types.ObjectId;
  requestedBy?: mongoose.Types.ObjectId;
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

const DonationSchema = new Schema<IDonation>(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: Object.values(DonationType),
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    images: [String],
    status: {
      type: String,
      enum: Object.values(DonationStatus),
      default: DonationStatus.PENDING,
    },
    pickupLocation: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    },
    pickupTimeWindow: {
      start: Date,
      end: Date,
    },
    expiryDate: Date,
    assignedDriverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedPackerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "Request",
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    requestedAt: {
      type: Date,
    },
    deliveryLocation: {
      address: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    needsDelivery: {
      type: Boolean,
      default: false,
    },
    notes: String,
    adminNotes: String,
    rejectionReason: String,
    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
DonationSchema.index({ donorId: 1 });
// Note: If you get duplicate index warnings, these might already exist in the database
// DonationSchema.index({ status: 1 });
// DonationSchema.index({ type: 1 });
DonationSchema.index({ createdAt: -1 });
DonationSchema.index({
  "pickupLocation.coordinates.latitude": 1,
  "pickupLocation.coordinates.longitude": 1,
});

export const Donation = mongoose.model<IDonation>("Donation", DonationSchema);
