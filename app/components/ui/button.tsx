// app/components/ui/button.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
          'disabled:pointer-events-none disabled:opacity-50',

          // Variants
          {
            'bg-purple-600 text-white hover:bg-purple-700':
              variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300':
              variant === 'secondary',
            'border border-purple-600 text-purple-600 hover:bg-purple-50':
              variant === 'outline',
            'text-purple-600 hover:bg-purple-50': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
          },

          // Sizes
          {
            'h-8 rounded-md px-3 text-sm': size === 'sm',
            'h-10 rounded-lg px-4 text-base': size === 'md',
            'h-12 rounded-lg px-6 text-lg': size === 'lg',
          },

          className
        )}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {isLoading && (
          <motion.div
            className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
