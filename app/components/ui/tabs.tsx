// app/components/ui/tabs.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTab,
  onChange,
  variant = 'default',
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = items.find(item => item.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Headers */}
      <div
        className={cn('flex space-x-1', {
          'border-b border-gray-200 dark:border-gray-700':
            variant === 'default',
          'rounded-lg bg-gray-100 p-1 dark:bg-gray-800': variant === 'pills',
        })}
      >
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => !item.disabled && handleTabChange(item.id)}
            disabled={item.disabled}
            className={cn(
              'relative px-4 py-2 text-sm font-medium transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50',
              {
                // Default variant
                'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300':
                  variant === 'default' && activeTab !== item.id,
                'text-purple-600 dark:text-purple-400':
                  variant === 'default' && activeTab === item.id,

                // Pills variant
                'rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white':
                  variant === 'pills' && activeTab !== item.id,
                'rounded-md bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white':
                  variant === 'pills' && activeTab === item.id,
              }
            )}
          >
            {item.label}

            {/* Active indicator for default variant */}
            {variant === 'default' && activeTab === item.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTabContent}
        </motion.div>
      </div>
    </div>
  );
};
