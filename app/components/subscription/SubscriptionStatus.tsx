// app/components/subscription/SubscriptionStatus.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Alert } from '@components/ui/alert';
import { ProgressBar } from '@components/ui/progress-bar';
import { SUBSCRIPTION_TIERS } from '@config/subscription';
import { formatDate, formatPrice } from '@utils/formatters';
import type { SubscriptionTier, SubscriptionStatus as Status } from '@types/subscription';

interface SubscriptionStatusProps {
  currentTier: SubscriptionTier;
  status: Status;
  currentPeriodEnd?: Date;
  storiesUsed: number;
  nextBillingDate?: Date;
  paymentMethod?: string;
  onManageBilling?: () => void;
  onUpgrade?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  currentTier,
  status,
  currentPeriodEnd,
  storiesUsed,
  nextBillingDate,
  paymentMethod,
  onManageBilling,
  onUpgrade,
  onCancel,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const tierConfig = SUBSCRIPTION_TIERS[currentTier];
  const usagePercentage = tierConfig.storyLimit === -1 
    ? 0 
    : (storiesUsed / tierConfig.storyLimit) * 100;

  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'success';
      case 'canceled': return 'warning';
      case 'past_due': return 'error';
      case 'incomplete': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'canceled': return AlertTriangle;
      case 'past_due': return XCircle;
      case 'incomplete': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'active': return 'Your subscription is active and up to date.';
      case 'canceled': return 'Your subscription has been canceled and will end on the renewal date.';
      case 'past_due': return 'Your payment is past due. Please update your payment method.';
      case 'incomplete': return 'Your subscription setup is incomplete. Please complete the payment.';
      default: return 'Unknown subscription status.';
    }
  };

  const handleManageBilling = async () => {
    if (!onManageBilling || isLoading) return;
    setIsLoading(true);
    try {
      await onManageBilling();
    } finally {
      setIsLoading(false);
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Plan Overview */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              currentTier === 'PRO' 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                : currentTier === 'PREMIUM'
                ? 'bg-purple-100 dark:bg-purple-900/20'
                : currentTier === 'BASIC'
                ? 'bg-blue-100 dark:bg-blue-900/20'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {currentTier === 'PRO' ? (
                <Crown className="text-white" size={24} />
              ) : (
                <Crown className={
                  currentTier === 'PREMIUM' ? 'text-purple-600' :
                  currentTier === 'BASIC' ? 'text-blue-600' : 'text-gray-600'
                } size={24} />
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentTier} Plan
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {currentTier === 'FREE' 
                  ? 'Free forever' 
                  : `${formatPrice(tierConfig.price)}/month`
                }
              </p>
            </div>
          </div>

          <Badge variant={getStatusColor()} className="flex items-center space-x-1">
            <StatusIcon size={14} />
            <span className="capitalize">{status}</span>
          </Badge>
        </div>

        {/* Status Message */}
        <Alert 
          variant={getStatusColor()} 
          className="mb-4"
        >
          {getStatusMessage()}
        </Alert>

        {/* Usage Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Stories Used This Month
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {storiesUsed} / {tierConfig.storyLimit === -1 ? '∞' : tierConfig.storyLimit}
            </span>
          </div>
          
          {tierConfig.storyLimit !== -1 && (
            <ProgressBar
              value={storiesUsed}
              max={tierConfig.storyLimit}
              variant={usagePercentage > 80 ? 'warning' : 'default'}
              showPercentage
            />
          )}

          {usagePercentage > 80 && tierConfig.storyLimit !== -1 && (
            <Alert variant="warning" className="text-sm">
              You're running low on stories this month. Consider upgrading for unlimited access!
            </Alert>
          )}
        </div>
      </Card>

      {/* Billing Information */}
      {currentTier !== 'FREE' && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Billing Information
          </h4>
          
          <div className="space-y-4">
            {nextBillingDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-gray-500" size={16} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Next billing date
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(nextBillingDate)}
                </span>
              </div>
            )}

            {currentPeriodEnd && status === 'canceled' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-orange-500" size={16} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Access ends on
                  </span>
                </div>
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {formatDate(currentPeriodEnd)}
                </span>
              </div>
            )}

            {paymentMethod && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="text-gray-500" size={16} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Payment method
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {paymentMethod}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="text-gray-500" size={16} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Billing cycle
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Monthly
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentTier !== 'PRO' && (
          <Button
            variant="primary"
            onClick={onUpgrade}
            className="w-full"
          >
            <Crown size={16} className="mr-2" />
            Upgrade Plan
          </Button>
        )}

        {currentTier !== 'FREE' && (
          <Button
            variant="outline"
            onClick={handleManageBilling}
            isLoading={isLoading}
            className="w-full"
          >
            <CreditCard size={16} className="mr-2" />
            Manage Billing
          </Button>
        )}

        {currentTier !== 'FREE' && status === 'active' && (
          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Cancel Subscription
          </Button>
        )}
      </div>

      {/* Feature Comparison Link */}
      {currentTier !== 'PRO' && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={onUpgrade}>
            Compare all plans and features →
          </Button>
        </div>
      )}
    </div>
  );
};