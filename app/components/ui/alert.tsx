// app/components/ui/alert.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@utils/cn';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
}) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-lg border-l-4 p-4',
        {
          'border-green-500 bg-green-50 dark:bg-green-900/20':
            variant === 'success',
          'border-red-500 bg-red-50 dark:bg-red-900/20': variant === 'error',
          'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20':
            variant === 'warning',
          'border-blue-500 bg-blue-50 dark:bg-blue-900/20': variant === 'info',
        },
        className
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon
            size={20}
            className={cn({
              'text-green-500': variant === 'success',
              'text-red-500': variant === 'error',
              'text-yellow-500': variant === 'warning',
              'text-blue-500': variant === 'info',
            })}
          />
        </div>

        <div className="ml-3 flex-1">
          {title && (
            <h3
              className={cn('mb-1 text-sm font-medium', {
                'text-green-800 dark:text-green-200': variant === 'success',
                'text-red-800 dark:text-red-200': variant === 'error',
                'text-yellow-800 dark:text-yellow-200': variant === 'warning',
                'text-blue-800 dark:text-blue-200': variant === 'info',
              })}
            >
              {title}
            </h3>
          )}

          <div
            className={cn('text-sm', {
              'text-green-700 dark:text-green-300': variant === 'success',
              'text-red-700 dark:text-red-300': variant === 'error',
              'text-yellow-700 dark:text-yellow-300': variant === 'warning',
              'text-blue-700 dark:text-blue-300': variant === 'info',
            })}
          >
            {children}
          </div>
        </div>

        {dismissible && (
          <button
            onClick={onDismiss}
            className={cn('ml-4 transition-opacity hover:opacity-70', {
              'text-green-500': variant === 'success',
              'text-red-500': variant === 'error',
              'text-yellow-500': variant === 'warning',
              'text-blue-500': variant === 'info',
            })}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
