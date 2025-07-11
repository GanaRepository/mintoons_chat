// app/components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Dropdown } from '@components/ui/dropdown';
import { Badge } from '@components/ui/badge';
import { cn } from '@utils/cn';

export const Header: React.FC = () => {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userMenuItems = [
    {
      label: 'Dashboard',
      value: 'dashboard',
      icon: <User size={16} />,
      onClick: () => (window.location.href = '/dashboard'),
    },
    {
      label: 'Settings',
      value: 'settings',
      icon: <Settings size={16} />,
      onClick: () => (window.location.href = '/profile'),
    },
    {
      label: 'Logout',
      value: 'logout',
      icon: <LogOut size={16} />,
      onClick: () => (window.location.href = '/api/auth/signout'),
    },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
        {
          'bg-white/95 shadow-md backdrop-blur-md dark:bg-gray-900/95':
            isScrolled,
          'bg-transparent': !isScrolled,
        }
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo/logo.svg"
              alt="MINTOONS"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-purple-600">MINTOONS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/explore-stories"
              className="text-gray-700 transition-colors hover:text-purple-600 dark:text-gray-300"
            >
              Explore Stories
            </Link>
            <Link
              href="/pricing"
              className="text-gray-700 transition-colors hover:text-purple-600 dark:text-gray-300"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-gray-700 transition-colors hover:text-purple-600 dark:text-gray-300"
            >
              About
            </Link>
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden items-center gap-4 md:flex">
            {session ? (
              <div className="flex items-center gap-4">
                {/* Subscription Badge */}
                <Badge variant="info" size="sm">
                  {session.user.subscriptionTier}
                </Badge>

                {/* User Dropdown */}
                <Dropdown
                  trigger={
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white">
                        {session.user.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {session.user.name}
                      </span>
                    </div>
                  }
                  items={userMenuItems}
                  align="right"
                />
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="md">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 md:hidden"
          >
            <nav className="container mx-auto space-y-4 px-4 py-4">
              <Link
                href="/explore-stories"
                className="block text-gray-700 hover:text-purple-600 dark:text-gray-300"
              >
                Explore Stories
              </Link>
              <Link
                href="/pricing"
                className="block text-gray-700 hover:text-purple-600 dark:text-gray-300"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="block text-gray-700 hover:text-purple-600 dark:text-gray-300"
              >
                About
              </Link>

              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block text-gray-700 hover:text-purple-600 dark:text-gray-300"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block text-gray-700 hover:text-purple-600 dark:text-gray-300"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => (window.location.href = '/api/auth/signout')}
                    className="block w-full text-left text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/login">
                    <Button variant="outline" size="md" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="md" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
