export enum TransactionType {
  DONATION = "donation",
  REFUND = "refund",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number; // Gross amount
  fee: number; // Stripe fee
  netAmount: number; // Net amount after fees
  currency: string;
  status: TransactionStatus;
  description: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemBalance {
  _id?: string;
  totalBalance: number; // Net balance (after fees)
  currency: string;
  totalDeposits: number; // Gross deposits
  totalWithdrawals: number;
  totalTransfers: number;
  totalDonations: number; // Gross donations
  totalFees: number; // Total Stripe fees
  lastUpdated?: Date;
}
