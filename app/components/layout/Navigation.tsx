// app/components/layout/Navigation.tsx
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, PenTool, BookOpen, Search, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@utils/cn';

export const Navigation: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const navigationItems = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Create',
      href: '/create-stories',
      icon: PenTool,
    },
    {
      name: 'Stories',
      href: '/my-stories',
      icon: BookOpen,
    },
    {
      name: 'Explore',
      href: '/explore-stories',
      icon: Search,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 md:hidden"
    >
      <div className="grid h-16 grid-cols-5">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex h-full flex-col items-center justify-center space-y-1 transition-colors',
                  {
                    'text-purple-600 dark:text-purple-400': isActive,
                    'text-gray-500 dark:text-gray-400': !isActive,
                  }
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.name}</span>

                {isActive && (
                  <motion.div
                    layoutId="activeNavItem"
                    className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 transform rounded-full bg-purple-600"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};
