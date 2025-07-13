// app/components/ui/input.tsx - Fixed version with icon prop
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: LucideIcon; // Add this for backward compatibility
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      icon: Icon, // Support both icon and leftIcon
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    // Use Icon as leftIcon if leftIcon is not provided
    const effectiveLeftIcon = leftIcon || (Icon && <Icon className="w-4 h-4" />);

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}

        <div className="relative">
          {effectiveLeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
              {effectiveLeftIcon}
            </div>
          )}

          <motion.input
            ref={ref}
            type={type}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              'w-full rounded-lg border border-gray-300 px-3 py-2',
              'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500',
              'transition-colors placeholder:text-gray-400',
              'dark:border-gray-600 dark:bg-gray-800 dark:text-white',
              {
                'pl-10': effectiveLeftIcon,
                'pr-10': rightIcon,
                'border-red-500 ring-red-500': error,
              },
              className
            )}
            animate={{
              borderColor: focused
                ? error
                  ? '#ef4444'
                  : '#8b5cf6'
                : error
                  ? '#ef4444'
                  : '#d1d5db',
            }}
            {...(props as React.ComponentPropsWithoutRef<typeof motion.input>)}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}

        {helper && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';