// app/components/gamification/ProgressRing.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#8b5cf6',
  backgroundColor = '#e5e7eb',
  showPercentage = true,
  animated = true,
  children,
  className
}) => {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke={backgroundColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Progress circle */}
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          initial={animated ? { strokeDashoffset: circumference } : {}}
          animate={{ strokeDashoffset }}
          transition={animated ? { duration: 1, ease: 'easeOut' } : {}}
        />
      </svg>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <motion.span
            initial={animated ? { opacity: 0, scale: 0.5 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={animated ? { delay: 0.5, duration: 0.5 } : {}}
            className="text-lg font-bold text-gray-900 dark:text-white"
          >
            {Math.round(progress)}%
          </motion.span>
        ))}
      </div>
    </div>
  );
};