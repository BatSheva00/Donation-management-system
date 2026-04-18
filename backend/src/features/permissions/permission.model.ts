import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  key: string; // e.g., 'donations.create', 'users.edit'
  description: string;
  category: string; // e.g., 'donations', 'users', 'requests'
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Note: key already has unique: true, so no need to add separate index
permissionSchema.index({ category: 1 });
permissionSchema.index({ isActive: 1 });

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);





