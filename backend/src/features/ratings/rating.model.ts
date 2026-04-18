import mongoose, { Schema, Document } from "mongoose";

export enum RatingType {
  DRIVER_RATING = "driver_rating", // Recipient rates driver
  DONOR_RATING = "donor_rating", // Driver rates donor
}

export interface IRating extends Document {
  _id: string;
  donationId: mongoose.Types.ObjectId;
  raterId: mongoose.Types.ObjectId; // Who is giving the rating
  ratedUserId: mongoose.Types.ObjectId; // Who is being rated
  type: RatingType;
  value: number; // 1-5 stars
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    donationId: {
      type: Schema.Types.ObjectId,
      ref: "Donation",
      required: [true, "Donation ID is required"],
    },
    raterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Rater ID is required"],
    },
    ratedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Rated user ID is required"],
    },
    type: {
      type: String,
      enum: Object.values(RatingType),
      required: [true, "Rating type is required"],
    },
    value: {
      type: Number,
      required: [true, "Rating value is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      maxlength: [500, "Comment cannot exceed 500 characters"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate ratings
// A user can only rate once per type per donation
RatingSchema.index({ donationId: 1, raterId: 1, type: 1 }, { unique: true });

// Index for efficient queries by rated user
RatingSchema.index({ ratedUserId: 1, type: 1, createdAt: -1 });

// Index for querying by donation
RatingSchema.index({ donationId: 1 });

// Index for querying by rater
RatingSchema.index({ raterId: 1 });

export const Rating = mongoose.model<IRating>("Rating", RatingSchema);
