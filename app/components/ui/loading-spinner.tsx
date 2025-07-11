// app/components/ui/loading-spinner.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  return (
    <motion.div
      className={cn(
        'rounded-full border-2 border-gray-300 border-t-purple-600',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        },
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};
