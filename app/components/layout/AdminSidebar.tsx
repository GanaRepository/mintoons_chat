// app/components/layout/AdminSidebar.tsx
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Shield,
  BarChart3,
  Settings,
  DollarSign,
  Flag,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@components/ui/badge';
import { cn } from '@utils/cn';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

// app/components/layout/AdminSidebar.tsx (continued)
export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session || session.user.role !== 'admin') return null;

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      badge: 2, // New users pending approval
    },
    {
      name: 'Mentors',
      href: '/admin/mentors',
      icon: Shield,
    },
    {
      name: 'Content Moderation',
      href: '/admin/content-moderation',
      icon: Flag,
      badge: 3, // Flagged content
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      name: 'Subscription Config',
      href: '/admin/subscription-config',
      icon: DollarSign,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

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
          {/* Admin Info */}
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-medium text-white">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {session.user.name}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="error" size="sm">
                    <Shield size={12} className="mr-1" />
                    Admin
                  </Badge>
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
                      'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      {
                        'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300':
                          isActive,
                        'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800':
                          !isActive,
                      }
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="warning" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* System Stats */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  $12.5K
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Revenue
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  1,234
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Users
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  5.6K
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Stories
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  98%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Uptime
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
