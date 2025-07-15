import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

export interface SubscriptionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  tier: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  storiesUsed: number;
  storiesRemaining: number;
  trialStart?: Date;
  trialEnd?: Date;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  prorationCredit: number;

  daysUntilRenewal: number;
  usagePercentage: number;
  canCreateStory: boolean;

  createdAt: Date;
  updatedAt: Date;

  incrementUsage(): Promise<void>;
  resetUsage(): Promise<void>;
  cancel(): Promise<void>;
  upgrade(newTier: string): Promise<void>;
}

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: {
      type: String,
      required: true,
      // ...existing code...
    },
    tier: {
      type: String,
      enum: ['FREE', 'BASIC', 'PREMIUM', 'PRO'],
      default: 'FREE',
      required: true,
      // ...existing code...
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing', 'incomplete'],
      default: 'active',
      required: true,
      // ...existing code...
    },
    stripeSubscriptionId: {
      type: String,
      // ...existing code...
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    stripePriceId: {
      type: String,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
      default: function () {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date;
      },
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
    },
    storiesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    storiesRemaining: {
      type: Number,
      default: function (this: SubscriptionDocument) {
        const limits = { FREE: 3, BASIC: 20, PREMIUM: 50, PRO: -1 };
        return limits[this.tier] - this.storiesUsed;
      },
    },
    trialStart: {
      type: Date,
    },
    trialEnd: {
      type: Date,
    },
    lastPaymentDate: {
      type: Date,
    },
    nextPaymentDate: {
      type: Date,
    },
    prorationCredit: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret._id = ret._id?.toString();
        if (ret.userId) ret.userId = ret.userId.toString();
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

subscriptionSchema.index({ userId: 1 }, { unique: true });
subscriptionSchema.index({ tier: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { sparse: true });

subscriptionSchema.virtual('daysUntilRenewal').get(function (this: SubscriptionDocument) {
  const now = new Date();
  const diffTime = this.currentPeriodEnd.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

subscriptionSchema.virtual('usagePercentage').get(function (this: SubscriptionDocument) {
  const limits = { FREE: 3, BASIC: 20, PREMIUM: 50, PRO: 999999 };
  const limit = limits[this.tier];
  if (limit === 999999) return 0;
  return Math.round((this.storiesUsed / limit) * 100);
});

subscriptionSchema.virtual('canCreateStory').get(function (this: SubscriptionDocument) {
  if (this.tier === 'PRO') return true;
  const limits = { FREE: 3, BASIC: 20, PREMIUM: 50, PRO: 999999 };
  return this.storiesUsed < limits[this.tier];
});

subscriptionSchema.methods.incrementUsage = async function (this: SubscriptionDocument): Promise<void> {
  this.storiesUsed += 1;

  const limits = { FREE: 3, BASIC: 20, PREMIUM: 50, PRO: 999999 };
  this.storiesRemaining = Math.max(0, limits[this.tier] - this.storiesUsed);

  await this.save();
};

subscriptionSchema.methods.resetUsage = async function (this: SubscriptionDocument): Promise<void> {
  this.storiesUsed = 0;

  const limits = { FREE: 3, BASIC: 20, PREMIUM: 50, PRO: 999999 };
  this.storiesRemaining = limits[this.tier];

  const now = new Date();
  this.currentPeriodStart = now;
  this.currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  await this.save();
};

subscriptionSchema.methods.cancel = async function (this: SubscriptionDocument): Promise<void> {
  this.status = 'canceled';
  this.canceledAt = new Date();
  this.cancelAtPeriodEnd = true;
  await this.save();
};

subscriptionSchema.methods.upgrade = async function (
  this: SubscriptionDocument,
  newTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO'
): Promise<void> {
  this.tier = newTier;
  this.status = 'active';
  this.cancelAtPeriodEnd = false;
  this.set('canceledAt', undefined);

  const limits = { FREE: 3, BASIC: 20, PREMIUM: 50, PRO: 999999 };
  this.storiesRemaining = Math.max(0, limits[newTier] - this.storiesUsed);

  await this.save();
};

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model<SubscriptionDocument>('Subscription', subscriptionSchema);
export default Subscription;