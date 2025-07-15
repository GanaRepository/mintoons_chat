import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface PasswordResetDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;

  generateToken(): string;
  isExpired(): boolean;
  markAsUsed(): Promise<void>;
}

interface PasswordResetModel extends mongoose.Model<PasswordResetDocument> {
  cleanupExpired(): Promise<any>;
  findValidToken(token: string): Promise<PasswordResetDocument | null>;
}

const passwordResetSchema = new Schema<PasswordResetDocument>(
  {
    userId: {
      type: String,
      required: true,
      // ...existing code...
    },
    token: {
      type: String,
      required: true,
      // ...existing code...
    },
    expiresAt: {
      type: Date,
      required: true,
      default: function () {
        return new Date(Date.now() + 3600000);
      },
    },
    isUsed: {
      type: Boolean,
      default: false,
      // ...existing code...
    },
    usedAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret._id = ret._id?.toString();
        if (ret.userId) ret.userId = ret.userId?.toString();
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

passwordResetSchema.index({ userId: 1, isUsed: 1 });
passwordResetSchema.index({ token: 1 }, { unique: true });
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

passwordResetSchema.pre('save', function (this: PasswordResetDocument, next) {
  if (!this.token) {
    this.token = this.generateToken();
  }
  next();
});

passwordResetSchema.methods.generateToken = function (this: PasswordResetDocument): string {
  return crypto.randomBytes(32).toString('hex');
};

passwordResetSchema.methods.isExpired = function (this: PasswordResetDocument): boolean {
  return new Date() > this.expiresAt;
};

passwordResetSchema.methods.markAsUsed = async function (this: PasswordResetDocument): Promise<void> {
  this.isUsed = true;
  this.usedAt = new Date();
  await this.save();
};

passwordResetSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true, usedAt: { $lt: new Date(Date.now() - 86400000) } },
    ],
  });
};

passwordResetSchema.statics.findValidToken = function (token: string) {
  return this.findOne({
    token,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).populate('userId', 'email firstName lastName');
};

const PasswordReset =
  mongoose.models.PasswordReset ||
  mongoose.model<PasswordResetDocument, PasswordResetModel>('PasswordReset', passwordResetSchema);
export default PasswordReset;