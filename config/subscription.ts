// config/subscription.ts - SINGLE SOURCE OF TRUTH FOR PRICING
// Change values here to update across entire platform

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number; // in USD dollars (9.99 = $9.99)
  storyLimit: number;
  features: string[];
  stripePriceId: string | null;
  isPopular?: boolean;
  sortOrder: number;
  badge?: string;
  color: string;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  FREE: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started with story writing',
    price: 0,
    storyLimit: 50, // EASY TO CHANGE - just modify this number
    features: [
      'Create up to 50 stories',
      'AI writing assistance',
      'Basic story assessment',
      'PDF download',
      'Progress tracking',
      'Sample stories access',
    ],
    stripePriceId: null,
    sortOrder: 1,
    color: 'gray',
  },

  BASIC: {
    id: 'basic',
    name: 'Basic',
    description: 'Great for regular young writers',
    price: 9.99, // $9.99 - EASY TO CHANGE
    storyLimit: 100, // EASY TO CHANGE
    features: [
      'Create up to 100 stories',
      'Advanced AI writing assistance',
      'Detailed story assessment',
      'PDF & Word download',
      'Progress tracking',
      'Email support',
      'Basic achievement badges',
    ],
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic_monthly',
    sortOrder: 2,
    color: 'blue',
  },

  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    description: 'Perfect for aspiring storytellers',
    price: 19.99, // $19.99 - EASY TO CHANGE
    storyLimit: 200, // EASY TO CHANGE
    features: [
      'Create up to 200 stories',
      'Premium AI writing assistance',
      'Advanced story assessment',
      'PDF & Word download',
      'Progress tracking',
      'Mentor feedback',
      'Priority email support',
      'All achievement badges',
      'Story sharing features',
    ],
    stripePriceId:
      process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
    isPopular: true,
    sortOrder: 3,
    badge: 'Most Popular',
    color: 'purple',
  },

  PRO: {
    id: 'pro',
    name: 'Pro',
    description: 'For serious young authors',
    price: 39.99, // $39.99 - EASY TO CHANGE
    storyLimit: 300, // EASY TO CHANGE
    features: [
      'Create up to 300 stories',
      'All AI writing features',
      'Comprehensive story assessment',
      'PDF & Word download',
      'Progress tracking',
      'Personal mentor feedback',
      'Priority support',
      'All achievement badges',
      'Story sharing features',
      'Advanced analytics',
      'Export to multiple formats',
      'Custom story templates',
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    sortOrder: 4,
    badge: 'Best Value',
    color: 'gold',
  },
} as const;

// UTILITY FUNCTIONS FOR SUBSCRIPTION MANAGEMENT
export class SubscriptionConfig {
  // Get all tiers sorted by price
  static getAllTiers(): SubscriptionTier[] {
    return Object.values(SUBSCRIPTION_TIERS).sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
  }

  // Get tier by ID (case-insensitive)
  static getTier(tierId: string): SubscriptionTier | null {
    const upperTierId = tierId.toUpperCase();
    const tier = SUBSCRIPTION_TIERS[upperTierId];
    return tier || null;
  }

  // Get story limit for a tier
  static getStoryLimit(tierId: string): number {
    const tier = this.getTier(tierId);
    // Use non-null assertion since we know FREE always exists
    return tier ? tier.storyLimit : SUBSCRIPTION_TIERS.FREE!.storyLimit;
  }

  // Get price for a tier
  static getPrice(tierId: string): number {
    const tier = this.getTier(tierId);
    return tier ? tier.price : 0;
  }

  // Format price for display
  static formatPrice(priceInDollars: number): string {
    if (priceInDollars === 0) return 'Free';
    return `${priceInDollars.toFixed(2)}`;
  }

  // Get formatted price with period
  static getFormattedPrice(tierId: string): string {
    const tier = this.getTier(tierId);
    if (!tier) return 'Free';

    if (tier.price === 0) return 'Free';
    return `${this.formatPrice(tier.price)}/month`;
  }

  // Check if user can create more stories
  static canCreateStory(userTier: string, currentStoryCount: number): boolean {
    const limit = this.getStoryLimit(userTier);
    return currentStoryCount < limit;
  }

  // Get remaining stories for user
  static getRemainingStories(
    userTier: string,
    currentStoryCount: number
  ): number {
    const limit = this.getStoryLimit(userTier);
    return Math.max(0, limit - currentStoryCount);
  }

  // Get usage percentage
  static getUsagePercentage(
    userTier: string,
    currentStoryCount: number
  ): number {
    const limit = this.getStoryLimit(userTier);
    return Math.min(100, Math.round((currentStoryCount / limit) * 100));
  }

  // Get next tier recommendation
  static getNextTier(currentTier: string): SubscriptionTier | null {
    const allTiers = this.getAllTiers();
    const currentIndex = allTiers.findIndex(tier => tier.id === currentTier);

    if (currentIndex === -1 || currentIndex === allTiers.length - 1) {
      return null; // Already at highest tier or tier not found
    }

    return allTiers[currentIndex + 1] || null; // Ensure null is returned instead of undefined
  }

  // Get tier color class for UI
  static getTierColorClass(tierId: string): string {
    const tier = this.getTier(tierId);
    if (!tier) return 'text-gray-500';

    const colorMap = {
      gray: 'text-gray-500',
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      gold: 'text-yellow-500',
    };

    return colorMap[tier.color as keyof typeof colorMap] || 'text-gray-500';
  }

  // Get tier background class for UI
  static getTierBgClass(tierId: string): string {
    const tier = this.getTier(tierId);
    if (!tier) return 'bg-gray-100';

    const bgMap = {
      gray: 'bg-gray-100',
      blue: 'bg-blue-100',
      purple: 'bg-purple-100',
      gold: 'bg-yellow-100',
    };

    return bgMap[tier.color as keyof typeof bgMap] || 'bg-gray-100';
  }

  // Check if tier has feature
  static hasFeature(tierId: string, feature: string): boolean {
    const tier = this.getTier(tierId);
    return tier ? tier.features.includes(feature) : false;
  }

  // Get tier by Stripe price ID
  static getTierByStripePriceId(
    stripePriceId: string
  ): SubscriptionTier | null {
    const allTiers = this.getAllTiers();
    const foundTier = allTiers.find(
      tier => tier.stripePriceId === stripePriceId
    );
    return foundTier || null;
  }

  // Validate tier ID
  static isValidTier(tierId: string): boolean {
    return this.getTier(tierId) !== null;
  }

  // Get upgrade path (for marketing)
  static getUpgradePath(currentTier: string): SubscriptionTier[] {
    const allTiers = this.getAllTiers();
    const currentIndex = allTiers.findIndex(tier => tier.id === currentTier);

    if (currentIndex === -1) return allTiers;

    return allTiers.slice(currentIndex + 1);
  }

  // Calculate savings for annual plans (if you add them later)
  static getAnnualSavings(tierId: string): number {
    const tier = this.getTier(tierId);
    if (!tier || tier.price === 0) return 0;

    // Example: 2 months free on annual (16.67% savings)
    const monthlyTotal = tier.price * 12;
    const annualPrice = tier.price * 10; // 10 months price for 12 months
    return monthlyTotal - annualPrice;
  }
}

// Export types for use in other files
export type TierIds = keyof typeof SUBSCRIPTION_TIERS;
export type TierFeatures = SubscriptionTier['features'][number];

// Constants for easy reference
export const TIER_IDS = {
  FREE: 'FREE' as const,
  BASIC: 'BASIC' as const,
  PREMIUM: 'PREMIUM' as const,
  PRO: 'PRO' as const,
} as const;

// Default tier for new users
export const DEFAULT_TIER = TIER_IDS.FREE;

// Admin configuration - for easy bulk updates
export const ADMIN_CONFIG = {
  // Easily modify story limits for promotions
  PROMO_MULTIPLIER: 1, // Set to 1.5 for 50% more stories, 2 for double

  // Feature flags
  FEATURES: {
    MENTOR_FEEDBACK: true,
    ACHIEVEMENT_SYSTEM: true,
    STORY_SHARING: true,
    EXPORT_FORMATS: true,
    REAL_TIME_COMMENTS: true,
  },

  // Promotional settings
  FREE_TIER_BOOST: false, // Set to true to temporarily increase free tier limit
  BLACK_FRIDAY_ACTIVE: false, // Special pricing events
} as const;

// Apply promotional multipliers
export function getPromotionalStoryLimit(tierId: string): number {
  const baseLimit = SubscriptionConfig.getStoryLimit(tierId);

  // Apply promo multiplier
  let limit = Math.floor(baseLimit * ADMIN_CONFIG.PROMO_MULTIPLIER);

  // Apply free tier boost if active
  if (tierId === TIER_IDS.FREE && ADMIN_CONFIG.FREE_TIER_BOOST) {
    limit = Math.floor(limit * 1.5); // 50% boost for free tier
  }

  return limit;
}
