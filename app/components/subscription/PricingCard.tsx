// app/components/subscription/PricingCard.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Star, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { SUBSCRIPTION_TIERS } from '@config/subscription';
import { formatPrice } from '@utils/formatters';
import { createCheckoutSession } from '@lib/subscription/stripe';
import type { SubscriptionTierType } from '../../../types/subscription';

interface PricingCardProps {
  tier: SubscriptionTierType; // Use SubscriptionTierType consistently
  currentTier?: SubscriptionTierType; // Change from SubscriptionTier to SubscriptionTierType
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  onSelect?: (tier: SubscriptionTierType) => void; // Change from SubscriptionTier to SubscriptionTierType
  className?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  currentTier,
  isPopular = false,
  isCurrentPlan = false,
  onSelect,
  className,
}) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const tierConfig = SUBSCRIPTION_TIERS[tier]; // Now works because tier is SubscriptionTierType (string)

  const handleSubscribe = async () => {
    if (!session || isLoading || isCurrentPlan) return;

    setIsLoading(true);
    try {
      const checkoutUrl = await createCheckoutSession({
        priceId: tierConfig.stripePriceId,
        userId: session.user.id,
        tier: tier, // tier is string now
        successUrl: `${window.location.origin}/dashboard?subscription=success`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fix the tier comparison logic
  const tierOrder: SubscriptionTierType[] = ['FREE', 'BASIC', 'PREMIUM', 'PRO'];

  const isUpgrade =
    currentTier && tierOrder.indexOf(tier) > tierOrder.indexOf(currentTier);

  const isDowngrade =
    currentTier && tierOrder.indexOf(tier) < tierOrder.indexOf(currentTier);

  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan';
    if (tier === 'FREE') return 'Get Started Free';
    if (isUpgrade) return `Upgrade to ${tierConfig.name}`; // Use tierConfig.name
    if (isDowngrade) return `Downgrade to ${tierConfig.name}`; // Use tierConfig.name
    return `Get ${tierConfig.name}`; // Use tierConfig.name
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'outline';
    if (isPopular || tier === 'PRO') return 'primary';
    return 'outline';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card
        className={`relative h-full overflow-hidden ${
          isPopular ? 'shadow-lg ring-2 ring-purple-500' : ''
        } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
      >
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 transform">
            <Badge variant="purple" className="px-4 py-1">
              <Star size={12} className="mr-1" />
              Most Popular
            </Badge>
          </div>
        )}

        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <div className="absolute right-0 top-0 bg-green-500 px-3 py-1 text-xs font-medium text-white">
            Current Plan
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mb-4">
              {tier === 'FREE' && (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <Zap className="text-gray-600 dark:text-gray-400" size={24} />
                </div>
              )}
              {tier === 'BASIC' && (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Zap className="text-blue-600" size={24} />
                </div>
              )}
              {tier === 'PREMIUM' && (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <Star className="text-purple-600" size={24} />
                </div>
              )}
              {tier === 'PRO' && (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
                  <Crown className="text-white" size={24} />
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {tierConfig.name}{' '}
              {/* Use tierConfig.name instead of tier directly */}
            </h3>

            <div className="mt-2">
              {tier === 'FREE' ? (
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  Free
                </div>
              ) : (
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(tierConfig.price)}
                  </span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">
                    /month
                  </span>
                </div>
              )}

              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {tierConfig.storyLimit === -1
                  ? 'Unlimited stories'
                  : `${tierConfig.storyLimit} stories/month`}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6 space-y-3">
            {tierConfig.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="flex-shrink-0">
                  <Check className="text-green-500" size={16} />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Action Button */}
          <Button
            variant={getButtonVariant()}
            size="lg"
            onClick={tier !== 'FREE' ? handleSubscribe : () => onSelect?.(tier)}
            disabled={isCurrentPlan || isLoading}
            isLoading={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : null}
            {getButtonText()}
          </Button>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            {tier !== 'FREE' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cancel anytime • No long-term contracts
              </p>
            )}
            {tier === 'PRO' && (
              <p className="mt-2 text-xs font-medium text-purple-600 dark:text-purple-400">
                🎉 Best value for serious young writers!
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
