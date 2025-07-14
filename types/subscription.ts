export type SubscriptionTierType = 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';

export interface Subscription {
  _id: string;
  userId: string;
  tier: SubscriptionTierType;
  status: SubscriptionStatus;

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
}

export interface SubscriptionTier {
  tier: SubscriptionTierType;
  name: string;
  description: string;
  price: number;
  stripePriceId: string;
  features: string[];
  storyLimit: number;
  priority: number;
  aiCollaboration: boolean;
  mentorFeedback: boolean;
  advancedAnalytics: boolean;
  customization: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTierType;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  storyLimit: number;
  isPopular?: boolean;
  stripePriceId: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  stripePaymentMethodId: string;
}

export interface BillingHistory {
  _id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripeInvoiceId: string;
  invoiceUrl?: string;
  description: string;
  paidAt?: Date;
  dueDate: Date;
  createdAt: Date;
}

export interface SubscriptionUsage {
  userId: string;
  tier: SubscriptionTierType;
  storiesUsed: number;
  storyLimit: number;
  usagePercentage: number;
  resetDate: Date;
  overageCount: number;
}

export interface SubscriptionAnalytics {
  totalSubscribers: number;
  activeSubscribers: number;
  canceledSubscribers: number;
  trialingSubscribers: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  conversionRate: number;
  
  tierDistribution: Record<SubscriptionTierType, {
    count: number;
    percentage: number;
    revenue: number;
  }>;
  
  revenueGrowth: Array<{
    month: string;
    revenue: number;
    subscribers: number;
  }>;
}

export interface SubscriptionCreateData {
  userId: string;
  tier: SubscriptionTierType;
  stripePriceId: string;
  stripeCustomerId?: string;
  trialDays?: number;
}

export interface SubscriptionUpdateData {
  tier?: SubscriptionTierType;
  status?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
}

export interface SubscriptionFilters {
  tier?: SubscriptionTierType;
  status?: SubscriptionStatus;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'currentPeriodEnd' | 'tier';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}