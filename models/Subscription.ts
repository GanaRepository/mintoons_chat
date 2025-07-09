// models/Subscription.ts - Subscription and billing model
import mongoose, { Schema, Document } from 'mongoose';
import type { UserSubscription } from '@types/subscription';

export interface SubscriptionDocument
  extends Omit<UserSubscription, '_id'>,
    Document {
  _id: mongoose.Types.ObjectId;
  updateUsage(storiesUsed: number): Promise<void>;
  resetUsage(): Promise<void>;
  cancelAtPeriodEnd(): Promise<void>;
  reactivate(): Promise<void>;
}

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    tier: {
      type: String,
      enum: ['FREE', 'BASIC', 'PREMIUM', 'PRO'],
      required: true,
      default: 'FREE',
    },

    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing', 'incomplete'],
      required: true,
      default: 'active',
    },

    // Stripe details
    stripeSubscriptionId: {
      type: String,
      sparse: true,
      index: true,
    },

    stripeCustomerId: {
      type: String,
      sparse: true,
      index: true,
    },

    stripePriceId: {
      type: String,
      sparse: true,
    },

    // Billing
    currentPeriodStart: {
      type: Date,
      required: true,
      default: Date.now,
    },

    currentPeriodEnd: {
      type: Date,
      required: true,
      default: function () {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      },
    },

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },

    canceledAt: {
      type: Date,
    },

    // Usage tracking
    storiesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    storiesRemaining: {
      type: Number,
      default: 50, // Free tier default
      min: 0,
    },

    // Trial information
    trialStart: {
      type: Date,
    },

    trialEnd: {
      type: Date,
    },

    // Billing history reference
    lastPaymentDate: {
      type: Date,
    },

    nextPaymentDate: {
      type: Date,
    },

    // Proration and credits
    prorationCredit: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
subscriptionSchema.index({ userId: 1 }, { unique: true });
subscriptionSchema.index({ tier: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { sparse: true });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });

// Virtual for days until renewal
subscriptionSchema.virtual('daysUntilRenewal').get(function (
  this: SubscriptionDocument
) {
  const now = new Date();
  const diff = this.currentPeriodEnd.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for usage percentage
subscriptionSchema.virtual('usagePercentage').get(function (
  this: SubscriptionDocument
) {
  const { SubscriptionConfig } = require('@config/subscription');
  const limit = SubscriptionConfig.getStoryLimit(this.tier);
  return Math.min(100, Math.round((this.storiesUsed / limit) * 100));
});

// Virtual for can create story
subscriptionSchema.virtual('canCreateStory').get(function (
  this: SubscriptionDocument
) {
  return this.storiesRemaining > 0 && this.status === 'active';
});

// Pre-save middleware to calculate remaining stories
subscriptionSchema.pre('save', function (this: SubscriptionDocument, next) {
  const { SubscriptionConfig } = require('@config/subscription');
  const limit = SubscriptionConfig.getStoryLimit(this.tier);
  this.storiesRemaining = Math.max(0, limit - this.storiesUsed);
  next();
});

// Pre-save middleware to update user's subscription tier
subscriptionSchema.pre(
  'save',
  async function (this: SubscriptionDocument, next) {
    if (this.isModified('tier') || this.isModified('status')) {
      try {
        const User = mongoose.model('User');
        await User.findByIdAndUpdate(this.userId, {
          subscriptionTier: this.tier,
          subscriptionStatus: this.status,
        });
      } catch (error) {
        console.error('Error updating user subscription tier:', error);
      }
    }
    next();
  }
);

// Method to update usage
subscriptionSchema.methods.updateUsage = async function (
  this: SubscriptionDocument,
  storiesUsed: number
): Promise<void> {
  this.storiesUsed = storiesUsed;
  await this.save();
};

// Method to reset usage (monthly reset)
subscriptionSchema.methods.resetUsage = async function (
  this: SubscriptionDocument
): Promise<void> {
  this.storiesUsed = 0;

  // Update period dates
  const now = new Date();
  this.currentPeriodStart = now;
  this.currentPeriodEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  );

  await this.save();
};

// Method to cancel at period end
subscriptionSchema.methods.cancelAtPeriodEnd = async function (
  this: SubscriptionDocument
): Promise<void> {
  this.cancelAtPeriodEnd = true;
  this.canceledAt = new Date();
  await this.save();
};

// Method to reactivate subscription
subscriptionSchema.methods.reactivate = async function (
  this: SubscriptionDocument
): Promise<void> {
  this.cancelAtPeriodEnd = false;
  this.canceledAt = undefined;
  this.status = 'active';
  await this.save();
};

// Static method to find expiring subscriptions
subscriptionSchema.statics.findExpiring = function (days: number = 3) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: 'active',
    currentPeriodEnd: { $lte: futureDate },
    cancelAtPeriodEnd: true,
  }).populate('userId', 'firstName lastName email');
};

// Static method to find overdue subscriptions
subscriptionSchema.statics.findOverdue = function () {
  const now = new Date();

  return this.find({
    status: { $in: ['active', 'past_due'] },
    currentPeriodEnd: { $lt: now },
  }).populate('userId', 'firstName lastName email');
};

// Static method to get subscription statistics
subscriptionSchema.statics.getStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: '$tier',
        count: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0],
          },
        },
        canceled: {
          $sum: {
            $cond: [{ $eq: ['$cancelAtPeriodEnd', true] }, 1, 0],
          },
        },
        averageUsage: { $avg: '$storiesUsed' },
      },
    },
  ]);
};

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model<SubscriptionDocument>('Subscription', subscriptionSchema);
export default Subscription;
