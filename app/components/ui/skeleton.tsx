// app/components/ui/skeleton.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}) => {
  const baseClass = cn(
    'bg-gray-200 dark:bg-gray-700 animate-pulse',
    {
      'rounded-md': variant === 'rectangular',
      'rounded-full': variant === 'circular',
      'h-4 rounded': variant === 'text',
    },
    className
  );

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              baseClass,
              index === lines - 1 && 'w-3/4' // Make last line shorter
            )}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={baseClass}
      style={style}
    />
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonCard: React.FC = () => (
  <div className="space-y-4 p-6">
    <Skeleton variant="rectangular" height="200px" />
    <Skeleton variant="text" lines={3} />
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    ))}
  </div>
);
