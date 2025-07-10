// models/PasswordReset.ts - Password reset token model
import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface PasswordResetDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  attempts: number;
  maxAttempts: number;
  generateToken(): string;
  isExpired(): boolean;
  markAsUsed(): Promise<void>;
}

// Static methods interface
interface PasswordResetModel extends mongoose.Model<PasswordResetDocument> {
  cleanupExpired(): Promise<any>;
  findValidToken(token: string): Promise<PasswordResetDocument | null>;
}

const passwordResetSchema = new Schema<PasswordResetDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      default: function () {
        return new Date(Date.now() + 3600000); // 1 hour from now
      },
      index: { expireAfterSeconds: 0 },
    },

    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },

    usedAt: {
      type: Date,
    },

    // Security tracking
    ipAddress: {
      type: String,
      trim: true,
    },

    userAgent: {
      type: String,
      trim: true,
    },

    // Attempt tracking
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
  }
);

// Indexes
passwordResetSchema.index({ userId: 1, isUsed: 1 });
passwordResetSchema.index({ token: 1 }, { unique: true });
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to generate token
passwordResetSchema.pre('save', function (this: PasswordResetDocument, next) {
  if (!this.token) {
    this.token = this.generateToken();
  }
  next();
});

// Method to generate secure token
passwordResetSchema.methods.generateToken = function (
  this: PasswordResetDocument
): string {
  return crypto.randomBytes(32).toString('hex');
};

// Method to check if token is expired
passwordResetSchema.methods.isExpired = function (
  this: PasswordResetDocument
): boolean {
  return new Date() > this.expiresAt;
};

// Method to mark token as used
passwordResetSchema.methods.markAsUsed = async function (
  this: PasswordResetDocument
): Promise<void> {
  this.isUsed = true;
  this.usedAt = new Date();
  await this.save();
};

// Static method to cleanup expired tokens
passwordResetSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true, usedAt: { $lt: new Date(Date.now() - 86400000) } }, // Remove used tokens older than 1 day
    ],
  });
};

// Static method to find valid token
passwordResetSchema.statics.findValidToken = function (token: string) {
  return this.findOne({
    token,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).populate('userId', 'email firstName lastName');
};

const PasswordReset =
  mongoose.models.PasswordReset ||
  mongoose.model<PasswordResetDocument, PasswordResetModel>(
    'PasswordReset',
    passwordResetSchema
  );
export default PasswordReset;
