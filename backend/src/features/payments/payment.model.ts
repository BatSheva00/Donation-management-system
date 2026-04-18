import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus } from '../../shared/types/enums';

export interface IPayment extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  metadata?: {
    donationId?: string;
    requestId?: string;
    [key: string]: any;
  };
  receiptUrl?: string;
  refundId?: string;
  refundedAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'usd',
      uppercase: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    description: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    receiptUrl: String,
    refundId: String,
    refundedAmount: Number,
    refundedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);






