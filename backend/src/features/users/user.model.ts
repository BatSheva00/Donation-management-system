import mongoose, { Schema, Document } from "mongoose";
import {
  UserStatus,
  ProfileCompletionStatus,
  DriverStatus,
} from "../../shared/types/enums";

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: {
    countryCode: string;
    number: string;
  };
  role: mongoose.Types.ObjectId; // Reference to Role model
  status: UserStatus;
  profileCompletionStatus: ProfileCompletionStatus;
  language: "en" | "he";
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshToken?: string;
  profileImage?: string;

  // Document uploads (for all users)
  documents?: Array<{
    type: string; // 'id', 'other'
    path: string;
    filename: string;
    uploadedAt: Date;
  }>;

  // Permission Overrides (user-specific permissions)
  permissionsGranted: mongoose.Types.ObjectId[];
  permissionsDenied: mongoose.Types.ObjectId[];

  // Base address (for all users)
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Business-specific fields (when role === BUSINESS)
  businessInfo?: {
    businessName: string;
    businessType: string;
    registrationNumber?: string;
    description?: string;
    website?: string;
    logo?: string;
    operatingHours?: {
      [key: string]: {
        open: string;
        close: string;
        isClosed: boolean;
      };
    };
    rating?: number;
    ratingCount?: number;
  };

  // Driver-specific fields (when role === DRIVER)
  driverInfo?: {
    licenseNumber: string;
    licenseExpiry: Date;
    vehicleType: string;
    vehicleModel?: string;
    vehiclePlateNumber: string;
    vehicleCapacity?: number;
    driverStatus: DriverStatus;
    currentLocation?: {
      latitude: number;
      longitude: number;
      updatedAt: Date;
    };
    rating?: number;
    ratingCount?: number;
    availability?: {
      [key: string]: {
        start: string;
        end: string;
        isAvailable: boolean;
      };
    };
    currentAssignment?: mongoose.Types.ObjectId;
  };

  // Donor rating fields (for all users who donate)
  donorRating?: number;
  donorRatingCount?: number;

  preferences?: {
    notifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    phone: {
      countryCode: {
        type: String,
        required: [true, "Country code is required"],
        trim: true,
      },
      number: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role is required"],
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.EMAIL_VERIFICATION,
    },
    profileCompletionStatus: {
      type: String,
      enum: Object.values(ProfileCompletionStatus),
      default: ProfileCompletionStatus.INCOMPLETE,
    },
    permissionsGranted: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
    permissionsDenied: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
    language: {
      type: String,
      enum: ["en", "he"],
      default: "en",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshToken: String,
    profileImage: String,
    documents: [
      {
        type: { type: String, required: true },
        path: { type: String, required: true },
        filename: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    // Business-specific fields (only for business users)
    businessInfo: {
      businessName: String,
      businessType: String,
      registrationNumber: String,
      description: String,
      website: String,
      logo: String,
      operatingHours: {
        type: Map,
        of: {
          open: String,
          close: String,
          isClosed: Boolean,
        },
      },
      rating: { type: Number, min: 0, max: 5 },
      ratingCount: { type: Number, default: 0 },
    },
    // Driver-specific fields (only for drivers)
    driverInfo: {
      licenseNumber: String,
      licenseExpiry: Date,
      vehicleType: String,
      vehicleModel: String,
      vehiclePlateNumber: String,
      vehicleCapacity: Number,
      driverStatus: {
        type: String,
        enum: Object.values(DriverStatus),
        default: DriverStatus.OFFLINE,
      },
      currentLocation: {
        type: {
          latitude: Number,
          longitude: Number,
          updatedAt: Date,
        },
        required: false,
        default: undefined,
      },
      rating: { type: Number, min: 0, max: 5 },
      ratingCount: { type: Number, default: 0 },
    },
    // Donor rating fields (for all users who donate)
    donorRating: { type: Number, min: 0, max: 5 },
    donorRatingCount: { type: Number, default: 0 },
    preferences: {
      notifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.verificationToken;
        delete ret.resetPasswordToken;
        delete ret.emailVerificationCode;
        return ret;
      },
    },
  }
);

// Indexes
// Note: email already has unique: true, so no need to add separate index
UserSchema.index(
  { "phone.countryCode": 1, "phone.number": 1 },
  { unique: true, sparse: true }
);
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ profileCompletionStatus: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
