import mongoose, { Schema, Document } from "mongoose";

export enum TransactionType {
  DONATION = "donation", // User donates money to the system via Stripe
  REFUND = "refund", // Refund transaction
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface ITransaction extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number; // Gross amount (what customer paid)
  fee: number; // Stripe fee
  netAmount: number; // Net amount after fees (what you receive)
  currency: string;
  status: TransactionStatus;
  description: string;

  // Stripe details
  stripePaymentIntentId?: string;
  stripeChargeId?: string;

  // Metadata
  metadata?: Record<string, any>;
  errorMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    fee: {
      type: Number,
      required: true,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      enum: ["USD", "EUR", "ILS"],
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: true,
      default: TransactionStatus.PENDING,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    stripePaymentIntentId: String,
    stripeChargeId: String,
    metadata: Schema.Types.Mixed,
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
TransactionSchema.index({ userId: 1, createdAt: -1 });
// Note: status and type already have index: true in schema (lines 50, 77)
// TransactionSchema.index({ status: 1 });
// TransactionSchema.index({ type: 1 });
TransactionSchema.index({ stripePaymentIntentId: 1 });

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
