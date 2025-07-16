// app/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  PenTool,
  BookOpen,
  TrendingUp,
  User,
  Crown,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@components/ui/badge';
import { ProgressBar } from '@components/ui/progress-bar';
import { SUBSCRIPTION_TIERS } from '@config/subscription';
import { cn } from '@utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/user-dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Create Stories',
      href: '/create-stories',
      icon: PenTool,
    },
    {
      name: 'My Stories',
      href: '/my-stories',
      icon: BookOpen,
    },
    {
      name: 'Progress',
      href: '/progress',
      icon: TrendingUp,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
  ];

  // Get current subscription tier info
  const currentTier = SUBSCRIPTION_TIERS[session.user.subscriptionTier];
  const storiesUsed = session.user.storyCount || 0;
  const storiesLimit = currentTier?.storyLimit || 0;
  const usagePercentage = (storiesUsed / storiesLimit) * 100;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64',
          'border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
          'overflow-y-auto',
          'lg:relative lg:top-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* User Info */}
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-medium text-white">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {session.user.name}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      session.user.subscriptionTier === 'PRO'
                        ? 'purple'
                        : 'default'
                    }
                    size="sm"
                  >
                    {session.user.subscriptionTier === 'PRO' && (
                      <Crown size={12} className="mr-1" />
                    )}
                    {session.user.subscriptionTier}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-500">
                    <Zap size={12} className="mr-1" />
                    {session.user.totalPoints || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.name} href={item.href} onClick={onClose}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={cn(
                      'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      {
                        'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300':
                          isActive,
                        'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800':
                          !isActive,
                      }
                    )}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Usage Stats */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Stories Used
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {storiesUsed}/{storiesLimit}
                </span>
              </div>

              <ProgressBar
                value={storiesUsed}
                max={storiesLimit}
                variant={usagePercentage > 80 ? 'warning' : 'default'}
                size="sm"
              />

              {usagePercentage > 80 && (
                <Link href="/pricing">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="cursor-pointer rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-center text-sm font-medium text-white"
                  >
                    Upgrade Plan
                  </motion.div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
