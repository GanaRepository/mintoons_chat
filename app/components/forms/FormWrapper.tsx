'use client';

import React, { FormEvent, ReactNode, useEffect } from 'react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { TRACKING_EVENTS } from '@utils/constants';

// Simple AuthUser interface for this component to avoid type conflicts
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  age: number;
  subscriptionTier: string;
}

export interface FormWrapperProps {
  children: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string;
  success?: string;
  className?: string;
  variant?: 'default' | 'mintoons' | 'card';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
  actionText?: string;
  formType?: 'register' | 'login' | 'story' | 'contact' | 'profile';
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
  backAction?: {
    text: string;
    onClick: () => void;
  };
  trackingEnabled?: boolean;
}

const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  onSubmit,
  title,
  subtitle,
  isLoading = false,
  error,
  success,
  className,
  variant = 'default',
  maxWidth = 'md',
  showProgress = false,
  currentStep = 1,
  totalSteps = 1,
  actionText = 'Submit',
  formType = 'default',
  secondaryAction,
  backAction,
  trackingEnabled = true,
}) => {
  const router = useRouter();
  const { data: session } = useSession();

  // Type-safe user extraction
  const user = session?.user
    ? ({
        id: session.user._id || '',
        email: session.user.email || '',
        name: session.user.name || '',
        role: (session.user as any).role || 'child',
        age: (session.user as any).age || 0,
        subscriptionTier: (session.user as any).subscriptionTier || 'FREE',
      } as AuthUser)
    : null;

  // Track form view using lib/analytics/tracker.ts integration
  useEffect(() => {
    if (trackingEnabled && formType) {
      // This would integrate with lib/analytics/tracker.ts
      const trackFormView = async () => {
        try {
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: TRACKING_EVENTS.PAGE_VIEW,
              userId: user?.id,
              data: {
                formType,
                page: `form_${formType}`,
                timestamp: new Date().toISOString(),
              },
            }),
          });
        } catch (error) {
          console.error('Analytics tracking failed:', error);
        }
      };

      trackFormView();
    }
  }, [formType, trackingEnabled, user?.id]);

  // Enhanced submit handler with analytics
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Track form submission attempt
    if (trackingEnabled) {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: TRACKING_EVENTS.FORM_SUBMIT,
            userId: user?.id,
            data: {
              formType,
              step: currentStep,
              timestamp: new Date().toISOString(),
            },
          }),
        });
      } catch (error) {
        console.error('Form submit tracking failed:', error);
      }
    }

    try {
      await onSubmit(e);

      // Track successful submission
      if (trackingEnabled && success) {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: `${formType}_success`,
            userId: user?.id,
            data: { formType, completedStep: currentStep },
          }),
        });
      }
    } catch (submitError) {
      // Track form errors
      if (trackingEnabled) {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: TRACKING_EVENTS.ERROR_OCCURRED,
            userId: user?.id,
            data: {
              formType,
              error:
                submitError instanceof Error
                  ? submitError.message
                  : 'Unknown error',
              step: currentStep,
            },
          }),
        });
      }
    }
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  const variantStyles = {
    default: 'bg-white border border-gray-200',
    mintoons:
      'bg-gradient-to-br from-mintoons-purple/5 via-white to-mintoons-pink/5 border border-mintoons-purple/20',
    card: 'bg-white border border-gray-200 shadow-lg',
  };

  return (
    <div
      className={clsx(
        'mx-auto w-full rounded-xl p-6',
        maxWidthClasses[maxWidth],
        variantStyles[variant],
        className
      )}
    >
      {/* Header Section */}
      {(title || showProgress) && (
        <div className="mb-6">
          {showProgress && totalSteps > 1 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-mintoons-purple to-mintoons-pink transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}

          {title && (
            <h2
              className={clsx(
                'mb-2 text-2xl font-bold',
                variant === 'mintoons'
                  ? 'bg-gradient-to-r from-mintoons-purple to-mintoons-pink bg-clip-text text-transparent'
                  : 'text-gray-900'
              )}
            >
              {title}
            </h2>
          )}

          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="flex items-center text-sm text-green-800">
            <span className="mr-2">✅</span>
            {success}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="flex items-center text-sm text-red-800">
            <span className="mr-2">❌</span>
            {error}
          </p>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
          {backAction && (
            <button
              type="button"
              onClick={backAction.onClick}
              disabled={isLoading}
              className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              {backAction.text}
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={clsx(
              'flex-1 rounded-lg px-6 py-3 font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              variant === 'mintoons'
                ? 'bg-gradient-to-r from-mintoons-purple to-mintoons-pink text-white hover:shadow-lg focus:ring-mintoons-purple/50'
                : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              actionText
            )}
          </button>

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              disabled={isLoading}
              className="rounded-lg border border-primary-600 bg-transparent px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-50"
            >
              {secondaryAction.text}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormWrapper;
