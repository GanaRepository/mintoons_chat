// app/components/ui/badge.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant = 'default', size = 'md', children, ...props },
    ref
  ) => {
    return (
      <motion.span
        ref={ref}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'inline-flex items-center rounded-full font-medium',

          // Variants
          {
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200':
              variant === 'default',
            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400':
              variant === 'success',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400':
              variant === 'warning',
            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400':
              variant === 'error',
            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400':
              variant === 'info',
            'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400':
              variant === 'purple',
          },

          // Sizes
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-1 text-sm': size === 'md',
            'px-3 py-1.5 text-base': size === 'lg',
          },

          className
        )}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.span>)}
      >
        {children}
      </motion.span>
    );
  }
);

Badge.displayName = 'Badge';
