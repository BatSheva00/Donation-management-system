import mongoose, { Schema, Document } from "mongoose";

export interface ISystemBalance extends Document {
  _id: string;
  totalBalance: number; // Net balance (after fees)
  currency: string;
  totalDeposits: number; // Gross deposits
  totalWithdrawals: number;
  totalTransfers: number;
  totalDonations: number; // Gross donations
  totalFees: number; // Total Stripe fees
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SystemBalanceSchema = new Schema<ISystemBalance>(
  {
    totalBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      enum: ["USD", "EUR", "ILS"],
    },
    totalDeposits: {
      type: Number,
      default: 0,
    },
    totalWithdrawals: {
      type: Number,
      default: 0,
    },
    totalTransfers: {
      type: Number,
      default: 0,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    totalFees: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Only one system balance record should exist
SystemBalanceSchema.index({ currency: 1 }, { unique: true });

export const SystemBalance = mongoose.model<ISystemBalance>(
  "SystemBalance",
  SystemBalanceSchema
);
