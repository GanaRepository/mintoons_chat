// app/components/animations/LoadingAnimation.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  variant?: 'dots' | 'pulse' | 'bounce' | 'write';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  variant = 'dots',
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map(index => (
          <motion.div
            key={index}
            className={`${sizeClasses[size]} rounded-full bg-purple-600`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-purple-600 ${className}`}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.3, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  }

  if (variant === 'bounce') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map(index => (
          <motion.div
            key={index}
            className={`${sizeClasses[size]} rounded-full bg-purple-600`}
            animate={{
              y: ['0%', '-100%', '0%'],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.1,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'write') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <motion.div
          className="h-6 w-6 rounded-full border-2 border-purple-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <span className="text-sm text-purple-600">Writing story...</span>
      </div>
    );
  }

  return null;
};
