// types/subscription.ts - Subscription-related types
export type SubscriptionTierType = 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete';

export type PaymentStatus =
  | 'succeeded'
  | 'pending'
  | 'failed'
  | 'canceled'
  | 'requires_action';

export interface SubscriptionTier {
  _id: string;
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

// Main subscription interface that matches the model exactly
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

  // Trial information (missing from original types)
  trialStart?: Date;
  trialEnd?: Date;

  // Billing history reference (missing from original types)
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;

  // Proration and credits (missing from original types)
  prorationCredit: number;

  // Virtual fields from model
  daysUntilRenewal: number;
  usagePercentage: number;
  canCreateStory: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Simplified usage interface (derived from UserSubscription)
export interface SubscriptionUsage {
  userId: string;
  tier: SubscriptionTierType;
  storiesUsed: number;
  storyLimit: number;
  usagePercentage: number;
  canCreateStory: boolean;
  daysUntilReset: number; // maps to daysUntilRenewal
}

export interface BillingHistory {
  _id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  invoiceId: string;
  tier: SubscriptionTierType; // Changed from string to proper type
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
  _id: string;
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

// Additional interfaces that might be useful
export interface SubscriptionCreateData {
  userId: string;
  tier: SubscriptionTierType;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  trialStart?: Date;
  trialEnd?: Date;
}

export interface SubscriptionUpdateData {
  tier?: SubscriptionTierType;
  status?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  storiesUsed?: number;
}

// Stats interface that matches the model's getStats aggregation
export interface SubscriptionStats {
  _id: SubscriptionTierType;
  count: number;
  active: number;
  canceled: number;
  averageUsage: number;
}