// app/components/ui/select.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@utils/cn';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="relative">
        <motion.button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border border-gray-300 px-3 py-2 text-left',
            'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-white',
            'disabled:cursor-not-allowed disabled:opacity-50',
            {
              'border-red-500 ring-red-500': error,
            },
            className
          )}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                selectedOption
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400'
              )}
            >
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown
              size={20}
              className={cn('transition-transform', isOpen && 'rotate-180')}
            />
          </div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
            >
              {options.map(option => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={cn(
                    'w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'flex items-center justify-between',
                    {
                      'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400':
                        option.value === value,
                    }
                  )}
                  whileHover={
                    !option.disabled
                      ? { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                      : {}
                  }
                >
                  <span>{option.label}</span>
                  {option.value === value && <Check size={16} />}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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
    </div>
  );
};
