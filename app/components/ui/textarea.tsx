// app/components/ui/textarea.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helper,
      maxLength,
      showCount = false,
      value,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
            {showCount && maxLength && (
              <span
                className={cn(
                  'text-xs',
                  currentLength > maxLength * 0.9
                    ? 'text-red-500'
                    : 'text-gray-500'
                )}
              >
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}

        <motion.textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'w-full resize-none rounded-lg border border-gray-300 px-3 py-2',
            'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500',
            'min-h-[100px] transition-colors placeholder:text-gray-400',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-white',
            {
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
          {...(props as React.ComponentPropsWithoutRef<typeof motion.textarea>)}
        />

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

Textarea.displayName = 'Textarea';
