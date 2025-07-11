// app/components/subscription/UsageIndicator.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  AlertTriangle,
  Crown,
  TrendingUp,
  Calendar,
  Target,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { ProgressBar } from '@components/ui/progress-bar';
import { Alert } from '@components/ui/alert';
import {
  SUBSCRIPTION_TIERS,
  getSubscriptionLimits,
  isWithinLimit,
} from '@config/subscription';
import { formatNumber, formatDate } from '@utils/formatters';
import { calculateUsagePercentage, getDaysUntilReset } from '@utils/helpers';
import type { SubscriptionTierType } from '../../../types/subscription';
import type { User } from '../../../types/user';

interface UsageIndicatorProps {
  user: User;
  onUpgrade?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  user,
  onUpgrade,
  showDetails = true,
  compact = false,
  className,
}) => {
  const { data: session } = useSession();
  const [currentUsage, setCurrentUsage] = useState({
    storiesThisMonth: user.storyCount || 0,
    lastResetDate: user.subscriptionCurrentPeriodEnd || new Date(),
  });

  const currentTier = user.subscriptionTier;
  const tierConfig = SUBSCRIPTION_TIERS[currentTier];
  const limits = getSubscriptionLimits(currentTier);

  const usagePercentage = calculateUsagePercentage(
    currentUsage.storiesThisMonth,
    limits.storyLimit
  );

  const daysUntilReset = getDaysUntilReset(currentUsage.lastResetDate);
  const isOverLimit = !isWithinLimit(
    currentUsage.storiesThisMonth,
    limits.storyLimit
  );

  const getUsageColor = (): 'error' | 'warning' | 'default' | 'success' => {
    if (isOverLimit) return 'error';
    if (usagePercentage >= 80) return 'warning';
    if (usagePercentage >= 60) return 'default';
    return 'success';
  };

  const getUpgradeRecommendation = (): SubscriptionTierType | null => {
    if (currentTier === 'PRO') return null;

    const tiers: SubscriptionTierType[] = ['FREE', 'BASIC', 'PREMIUM', 'PRO'];
    const currentIndex = tiers.indexOf(currentTier);

    for (let i = currentIndex + 1; i < tiers.length; i++) {
      const nextTier = tiers[i];
      const nextLimits = getSubscriptionLimits(nextTier);
      if (isWithinLimit(currentUsage.storiesThisMonth, nextLimits.storyLimit)) {
        return nextTier;
      }
    }

    return 'PRO'; // Unlimited
  };

  const recommendedTier = getUpgradeRecommendation();

  // Format price helper - convert dollars to display format
  const formatTierPrice = (priceInDollars: number): string => {
    if (priceInDollars === 0) return 'Free';
    return `$${priceInDollars.toFixed(2)}`;
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Stories</span>
            <span
              className={`font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}
            >
              {formatNumber(currentUsage.storiesThisMonth)}/
              {limits.storyLimit === -1 ? '∞' : formatNumber(limits.storyLimit)}
            </span>
          </div>
          <ProgressBar
            value={currentUsage.storiesThisMonth}
            max={limits.storyLimit === -1 ? 100 : limits.storyLimit}
            variant={getUsageColor()}
            size="sm"
          />
        </div>

        {isOverLimit && onUpgrade && (
          <Button variant="primary" size="sm" onClick={onUpgrade}>
            Upgrade
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="text-purple-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Usage This Month
            </h3>
          </div>

          <Badge
            variant={currentTier === 'PRO' ? 'purple' : 'default'}
            className="flex items-center space-x-1"
          >
            {currentTier === 'PRO' && <Crown size={12} />}
            <span>{tierConfig.name}</span>
          </Badge>
        </div>

        {/* Usage Warning */}
        {isOverLimit && (
          <Alert variant="error" title="Usage Limit Exceeded">
            You've exceeded your monthly story limit. Upgrade your plan to
            continue creating stories.
          </Alert>
        )}

        {usagePercentage >= 80 && !isOverLimit && (
          <Alert variant="warning" title="Approaching Limit">
            You're approaching your monthly story limit. Consider upgrading to
            avoid interruption.
          </Alert>
        )}

        {/* Usage Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Stories Created
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatNumber(currentUsage.storiesThisMonth)} /{' '}
              {limits.storyLimit === -1
                ? 'Unlimited'
                : formatNumber(limits.storyLimit)}
            </span>
          </div>

          <ProgressBar
            value={currentUsage.storiesThisMonth}
            max={limits.storyLimit === -1 ? 100 : limits.storyLimit}
            variant={getUsageColor()}
            size="lg"
            showPercentage={limits.storyLimit !== -1}
          />
        </div>

        {showDetails && (
          <>
            {/* Usage Stats */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(currentUsage.storiesThisMonth)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {limits.storyLimit === -1
                    ? '∞'
                    : formatNumber(
                        Math.max(
                          0,
                          limits.storyLimit - currentUsage.storiesThisMonth
                        )
                      )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Remaining
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white">
                  <Calendar size={16} className="mr-1" />
                  {daysUntilReset}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Days to Reset
                </div>
              </div>
            </div>

            {/* Reset Information */}
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex items-center space-x-2 text-sm">
                <Target className="text-gray-500" size={16} />
                <span className="text-gray-700 dark:text-gray-300">
                  Usage resets on {formatDate(currentUsage.lastResetDate)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Upgrade Recommendation */}
        {recommendedTier && onUpgrade && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:from-purple-900/20 dark:to-pink-900/20"
          >
            <div className="flex items-start space-x-3">
              <TrendingUp
                className="mt-0.5 flex-shrink-0 text-purple-600"
                size={20}
              />
              <div className="flex-1">
                <h4 className="mb-1 font-medium text-gray-900 dark:text-white">
                  Recommended: {SUBSCRIPTION_TIERS[recommendedTier].name} Plan
                </h4>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  Get{' '}
                  {SUBSCRIPTION_TIERS[recommendedTier].storyLimit === -1
                    ? 'unlimited stories'
                    : `${formatNumber(SUBSCRIPTION_TIERS[recommendedTier].storyLimit)} stories per month`}{' '}
                  for{' '}
                  {SUBSCRIPTION_TIERS[recommendedTier].price === 0
                    ? 'free'
                    : `${formatTierPrice(SUBSCRIPTION_TIERS[recommendedTier].price)}/month`}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onUpgrade}
                  className="w-full sm:w-auto"
                >
                  <Crown size={14} className="mr-2" />
                  Upgrade to {SUBSCRIPTION_TIERS[recommendedTier].name}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Plan Features */}
        {showDetails && (
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Your {tierConfig.name} Plan Includes:
            </h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {tierConfig.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-600" />
                  <span>{feature}</span>
                </li>
              ))}
              {tierConfig.features.length > 3 && (
                <li className="ml-3.5 text-xs text-gray-500">
                  +{tierConfig.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
