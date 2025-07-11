// app/components/ui/dropdown.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@utils/cn';

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'left',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute z-50 mt-2 w-56 bg-white dark:bg-gray-800',
              'rounded-lg border border-gray-200 shadow-lg dark:border-gray-700',
              {
                'left-0': align === 'left',
                'right-0': align === 'right',
              }
            )}
          >
            <div className="py-1">
              {items.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  whileHover={
                    !item.disabled
                      ? { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                      : {}
                  }
                  className={cn(
                    'flex w-full items-center space-x-2 px-4 py-2 text-left text-sm',
                    'transition-colors hover:bg-gray-100 dark:hover:bg-gray-700',
                    {
                      'cursor-not-allowed text-gray-400': item.disabled,
                      'text-gray-900 dark:text-white': !item.disabled,
                    }
                  )}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
