// app/components/subscription/PaymentForm.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Alert } from '@components/ui/alert';
import { Badge } from '@components/ui/badge';
import { SUBSCRIPTION_TIERS } from '@config/subscription';
import { formatPrice } from '@utils/formatters';
import type { SubscriptionTier } from '../../../types/subscription';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  selectedTier: SubscriptionTier;
  userEmail?: string;
  onSuccess: (subscriptionId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  selectedTier,
  userEmail,
  onSuccess,
  onError,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: userEmail || '',
    country: 'US',
  });

  const tierConfig = selectedTier;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card information is required.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
          },
        });

      if (paymentMethodError) {
        onError(
          paymentMethodError.message || 'Payment method creation failed.'
        );
        return;
      }

      // Create subscription on backend
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: selectedTier,
          paymentMethodId: paymentMethod.id,
          customerInfo,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        onError(result.error || 'Subscription creation failed.');
        return;
      }

      // Handle 3D Secure if required
      if (result.requiresAction) {
        const { error: confirmError } = await stripe.confirmCardPayment(
          result.clientSecret
        );

        if (confirmError) {
          onError(confirmError.message || 'Payment confirmation failed.');
          return;
        }
      }

      onSuccess(result.subscriptionId);
    } catch (error) {
      onError('An unexpected error occurred. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="mx-auto max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Plan Summary */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {selectedTier.name} Plan
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tierConfig.storyLimit === -1
                  ? 'Unlimited stories'
                  : `${tierConfig.storyLimit} stories/month`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(tierConfig.price)}
              </div>
              <div className="text-sm text-gray-500">per month</div>
            </div>
          </div>
        </Card>

        {/* Customer Information */}
        <Card className="p-6">
          <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Customer Information
          </h4>

          <div className="space-y-4">
            <Input
              label="Full Name"
              value={customerInfo.name}
              onChange={e =>
                setCustomerInfo(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={customerInfo.email}
              onChange={e =>
                setCustomerInfo(prev => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter your email"
              required
            />
          </div>
        </Card>

        {/* Payment Information */}
        <Card className="p-6">
          <div className="mb-4 flex items-center space-x-2">
            <CreditCard className="text-gray-600" size={20} />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Payment Information
            </h4>
            <Badge
              variant="success"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Lock size={10} />
              <span>Secure</span>
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Card Information
              </label>
              <div className="rounded-lg border border-gray-300 p-3 dark:border-gray-600">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            {/* Security Features */}
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="mb-2 flex items-center space-x-2">
                <Lock className="text-green-600" size={16} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Your payment is secure
                </span>
              </div>
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <Check size={12} className="text-green-500" />
                  <span>256-bit SSL encryption</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={12} className="text-green-500" />
                  <span>PCI DSS compliant</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={12} className="text-green-500" />
                  <span>Cancel anytime</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!stripe || isProcessing}
                isLoading={isProcessing}
                className="w-full"
              >
                {isProcessing
                  ? 'Processing...'
                  : `Subscribe for ${formatPrice(tierConfig.price)}/month`}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isProcessing}
                className="w-full"
              >
                Cancel
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                By subscribing, you agree to our{' '}
                <a
                  href="/terms"
                  className="text-purple-600 hover:text-purple-700"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  className="text-purple-600 hover:text-purple-700"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export const PaymentForm: React.FC<PaymentFormProps> = props => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};
