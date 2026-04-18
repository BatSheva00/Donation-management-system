import mongoose, { Schema, Document } from "mongoose";

/**
 * System-wide statistics - singleton document
 */
export interface ISystemStats extends Document {
  _id: string;
  totalDonations: number; // all donations created
  totalRequests: number; // all requests created
  totalCompletedDonations: number; // donations + requests that reached completed/fulfilled
  uniqueUsersHelped: number; // unique users who received help
  totalDrivers: number; // registered drivers
  totalBusinesses: number; // registered businesses
  totalUsers: number; // all registered users
  lastUpdated: Date;
}

const SystemStatsSchema = new Schema<ISystemStats>(
  {
    totalDonations: { type: Number, default: 0 },
    totalRequests: { type: Number, default: 0 },
    totalCompletedDonations: { type: Number, default: 0 },
    uniqueUsersHelped: { type: Number, default: 0 },
    totalDrivers: { type: Number, default: 0 },
    totalBusinesses: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const SystemStats = mongoose.model<ISystemStats>(
  "SystemStats",
  SystemStatsSchema
);

/**
 * User-specific statistics
 */
export interface IUserStats extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  // All-time stats
  donationsCompleted: number; // donations they made that were completed
  totalDonationsMade: number; // all donations created (any status)
  totalRequestsMade: number; // all requests they created
  totalDeliveries: number; // deliveries completed (for drivers)
  totalPeopleHelped: number; // unique people they helped
  // Monthly stats
  monthlyPeopleHelped: number; // people helped this month
  monthlyDonations: number; // donations this month
  monthlyDeliveries: number; // deliveries this month
  currentMonth: string; // Format: "YYYY-MM" to track which month the monthly stats are for
  // Tracking sets (for unique counts)
  helpedUserIds: mongoose.Types.ObjectId[]; // users they've helped (for uniqueness)
  monthlyHelpedUserIds: mongoose.Types.ObjectId[]; // users helped this month
  lastUpdated: Date;
}

const UserStatsSchema = new Schema<IUserStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // All-time stats
    donationsCompleted: { type: Number, default: 0 },
    totalDonationsMade: { type: Number, default: 0 },
    totalRequestsMade: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    totalPeopleHelped: { type: Number, default: 0 },
    // Monthly stats
    monthlyPeopleHelped: { type: Number, default: 0 },
    monthlyDonations: { type: Number, default: 0 },
    monthlyDeliveries: { type: Number, default: 0 },
    currentMonth: {
      type: String,
      default: () => new Date().toISOString().slice(0, 7),
    },
    // Tracking arrays
    helpedUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    monthlyHelpedUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// No need for explicit index since unique: true already creates one

export const UserStats = mongoose.model<IUserStats>(
  "UserStats",
  UserStatsSchema
);

/**
 * Helped users tracking - to count unique users helped system-wide
 */
export interface IHelpedUser extends Document {
  userId: mongoose.Types.ObjectId;
  firstHelpedAt: Date;
  lastHelpedAt: Date;
  totalTimesHelped: number;
}

const HelpedUserSchema = new Schema<IHelpedUser>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstHelpedAt: { type: Date, default: Date.now },
    lastHelpedAt: { type: Date, default: Date.now },
    totalTimesHelped: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

// No need for explicit index since unique: true already creates one

export const HelpedUser = mongoose.model<IHelpedUser>(
  "HelpedUser",
  HelpedUserSchema
);
