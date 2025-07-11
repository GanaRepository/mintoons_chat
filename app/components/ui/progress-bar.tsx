// app/components/ui/progress-bar.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = false,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
          {
            'h-2': size === 'sm',
            'h-3': size === 'md',
            'h-4': size === 'lg',
          }
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full transition-colors', {
            'bg-blue-600': variant === 'default',
            'bg-green-600': variant === 'success',
            'bg-yellow-600': variant === 'warning',
            'bg-red-600': variant === 'error',
          })}
        />
      </div>
    </div>
  );
};
