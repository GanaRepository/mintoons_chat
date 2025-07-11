// app/components/layout/MentorSidebar.tsx
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@components/ui/badge';
import { cn } from '@utils/cn';

interface MentorSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const MentorSidebar: React.FC<MentorSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session || session.user.role !== 'mentor') return null;

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/mentor-dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Students',
      href: '/student-stories',
      icon: Users,
      badge: 5, // Number of pending reviews
    },
    {
      name: 'Progress',
      href: '/student-progress',
      icon: TrendingUp,
    },
    {
      name: 'Reviews',
      href: '/reviews',
      icon: MessageSquare,
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
          {/* Mentor Info */}
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-medium text-white">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {session.user.name}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="info" size="sm">
                    <Award size={12} className="mr-1" />
                    Mentor
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
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300':
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
                      <Badge variant="error" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Stats */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  12
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Active Students
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  48
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Stories Reviewed
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
