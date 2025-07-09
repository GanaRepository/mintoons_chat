// types/subscription.ts - Subscription-related types
export type SubscriptionTierType = 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete';

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  storyLimit: number;
  features: string[];
  stripePriceId: string | null;
  isPopular?: boolean;
  sortOrder: number;
  badge?: string;
  color: string;
}

export interface UserSubscription {
  _id: string;
  userId: string;
  tier: SubscriptionTierType;
  status: SubscriptionStatus;

  // Stripe details
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;

  // Billing
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;

  // Usage tracking
  storiesUsed: number;
  storiesRemaining: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionUsage {
  userId: string;
  tier: SubscriptionTierType;
  storiesUsed: number;
  storyLimit: number;
  usagePercentage: number;
  canCreateStory: boolean;
  daysUntilReset: number;
}

export interface BillingHistory {
  _id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceId: string;
  invoiceUrl?: string;
  description: string;
  paidAt?: Date;
  createdAt: Date;
}

export interface SubscriptionChange {
  fromTier: SubscriptionTierType;
  toTier: SubscriptionTierType;
  effectiveDate: Date;
  prorationAmount?: number;
}

export interface CheckoutSession {
  sessionId: string;
  tier: SubscriptionTierType;
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  mode: 'subscription' | 'payment';
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  processed: boolean;
  processedAt?: Date;
  createdAt: Date;
}

export interface SubscriptionMetrics {
  totalSubscribers: number;
  activeSubscriptions: number;
  churnRate: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  tierDistribution: Record<SubscriptionTierType, number>;
  conversionRate: number;
}

export interface PricingCalculation {
  tier: SubscriptionTierType;
  monthlyPrice: number;
  annualPrice?: number;
  savings?: number;
  pricePerStory: number;
  features: string[];
}
