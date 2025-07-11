// app/components/ui/card.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = 'default', padding = 'md', children, ...props },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -2 }}
        className={cn(
          'rounded-xl bg-white transition-shadow dark:bg-gray-800',
          {
            'shadow-md hover:shadow-lg': variant === 'default',
            'border border-gray-200 dark:border-gray-700':
              variant === 'outlined',
            'shadow-lg hover:shadow-xl': variant === 'elevated',
          },
          {
            'p-4': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
          },
          className
        )}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
