import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  key: string; // e.g., 'admin', 'business', 'driver'
  description: string;
  permissions: mongoose.Types.ObjectId[]; // Array of permission IDs
  isActive: boolean;
  isSystemRole: boolean; // Cannot be deleted if true
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
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
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Note: key already has unique: true, so no need to add separate index
roleSchema.index({ isActive: 1 });

export const Role = mongoose.model<IRole>('Role', roleSchema);





