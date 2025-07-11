// app/components/subscription/UpgradePrompt.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Sparkles, 
  X, 
  ArrowRight,
  Check,
  Zap
} from 'lucide-react';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Modal } from '@components/ui/modal';
import { SUBSCRIPTION_TIERS, getNextTier, getTierBenefits } from '@config/subscription';
import { formatPrice } from '@utils/formatters';
import { createCheckoutSession } from '@lib/subscription/stripe';
import type { SubscriptionTier } from '@types/subscription';
import type { User } from '@types/user';

interface UpgradePromptProps {
  user: User;
  trigger?: 'usage_limit' | 'feature_gate' | 'periodic' | 'manual';
  suggestedTier?: SubscriptionTier;
  onClose?: () => void;
  onUpgrade?: (tier: SubscriptionTier) => void;
  isModal?: boolean;
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  user,
  trigger = 'manual',
  suggestedTier,
  onClose,
  onUpgrade,
  isModal = false,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  const currentTier = user.subscriptionTier as SubscriptionTier;
  const nextTier = getNextTier(currentTier);
  const recommendedTier = suggestedTier || nextTier;

  const getPromptContent = () => {
    switch (trigger) {
      case 'usage_limit':
        return {
          title: 'Story Limit Reached! 📚',
          subtitle: 'Keep your creativity flowing with more stories',
          description: 'You\'ve reached your monthly story limit. Upgrade to continue creating amazing stories with AI assistance.',
          urgency: 'high'
        };
      case 'feature_gate':
        return {
          title: 'Unlock Premium Features ✨',
          subtitle: 'Take your storytelling to the next level',
          description: 'This feature is available with a premium plan. Upgrade to access advanced AI tools and unlimited creativity.',
          urgency: 'medium'
        };
      case 'periodic':
        return {
          title: 'Ready for More Stories? 🚀',
          subtitle: 'You\'re doing great! Time to level up',
          description: 'You\'re an active writer! Upgrade to get more stories and advanced features to enhance your creativity.',
          urgency: 'low'
        };
      default:
        return {
          title: 'Upgrade Your Plan 🎯',
          subtitle: 'More stories, more features, more fun',
          description: 'Unlock the full potential of MINTOONS with a premium subscription.',
          urgency: 'medium'
        };
    }
  };

  const promptContent = getPromptContent();
  const tierOptions = Object.keys(SUBSCRIPTION_TIERS)
    .filter(tier => tier !== 'FREE' && tier !== currentTier) as SubscriptionTier[];

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const checkoutUrl = await createCheckoutSession({
        priceId: SUBSCRIPTION_TIERS[tier].stripePriceId,
        userId: user.id,
        tier: tier,
        successUrl: `${window.location.origin}/dashboard?upgrade=success`,
        cancelUrl: window.location.href,
      });

      window.location.href = checkoutUrl;
      onUpgrade?.(tier);
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const UpgradeContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full text-white mb-4"
        >
          <Crown size={32} />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {promptContent.title}
        </h2>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          {promptContent.subtitle}
        </p>
        
        <p className="text-sm text-gray-500 dark:text-gray-500">
          {promptContent.description}
        </p>
      </div>

      {/* Current vs Recommended Comparison */}
      {recommendedTier && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Plan */}
          <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <Badge variant="default" size="sm" className="mb-2">Current</Badge>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {currentTier} Plan
              </h3>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-2">
                {SUBSCRIPTION_TIERS[currentTier].price === 0 ? 'Free' : formatPrice(SUBSCRIPTION_TIERS[currentTier].price)}
              </div>
              <div className="mt-3 space-y-2">
                {SUBSCRIPTION_TIERS[currentTier].features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Check size={14} className="mr-2 text-gray-400" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recommended Plan */}
          <Card className="p-4 border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="text-center">
              <Badge variant="purple" size="sm" className="mb-2">
                <Sparkles size={12} className="mr-1" />
                Recommended
              </Badge>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {recommendedTier} Plan
              </h3>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {formatPrice(SUBSCRIPTION_TIERS[recommendedTier].price)}
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <div className="mt-3 space-y-2">
                {SUBSCRIPTION_TIERS[recommendedTier].features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <Check size={14} className="mr-2 text-green-500" />
                    {feature}
                  </div>
                ))}
                {SUBSCRIPTION_TIERS[recommendedTier].features.length > 3 && (
                  <div className="text-xs text-purple-600 dark:text-purple-400">
                    +{SUBSCRIPTION_TIERS[recommendedTier].features.length - 3} more features
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tier Selection */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white text-center">
          Choose Your Plan
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {tierOptions.map((tier) => {
            const tierConfig = SUBSCRIPTION_TIERS[tier];
            const isRecommended = tier === recommendedTier;
            
            return (
              <motion.button
                key={tier}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUpgrade(tier)}
                disabled={isLoading}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  isRecommended
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      tier === 'PRO' 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : 'bg-purple-100 dark:bg-purple-900/20'
                    }`}>
                      {tier === 'PRO' ? (
                        <Crown className="text-white" size={20} />
                      ) : (
                        <Zap className="text-purple-600" size={20} />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {tier} Plan
                        </h3>
                        {isRecommended && (
                          <Badge variant="purple" size="sm">
                            <Sparkles size={10} className="mr-1" />
                            Best Value
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {tierConfig.storyLimit === -1 
                          ? 'Unlimited stories' 
                          : `${tierConfig.storyLimit} stories/month`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(tierConfig.price)}
                    </div>
                    <div className="text-sm text-gray-500">/month</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Benefits Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          🎉 Why Upgrade?
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Create more amazing stories with AI assistance</li>
          <li>• Access advanced writing tools and features</li>
          <li>• Get detailed AI feedback on your writing</li>
          <li>• Cancel anytime, no long-term commitment</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-3">
        {onClose && (
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Maybe Later
          </Button>
        )}
        
        {recommendedTier && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleUpgrade(recommendedTier)}
            isLoading={isLoading}
            className="min-w-[160px]"
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                <Crown size={16} className="mr-2" />
                Upgrade to {recommendedTier}
                <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <Modal
        isOpen={true}
        onClose={onClose || (() => {})}
        size="lg"
        className="max-w-2xl"
      >
        {UpgradeContent}
      </Modal>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {UpgradeContent}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        )}
      </div>
    </Card>
  );
};