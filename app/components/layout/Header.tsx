// app/components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Dropdown } from '@components/ui/dropdown';
import { Badge } from '@components/ui/badge';
import { cn } from '@utils/cn';

export const Header: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
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
      onClick: () => router.push('/user-dashboard'),
    },
    {
      label: 'Settings',
      value: 'settings',
      icon: <Settings size={16} />,
      onClick: () => router.push('/profile'),
    },
    {
      label: 'Logout',
      value: 'logout',
      icon: <LogOut size={16} />,
      onClick: () => router.push('/api/auth/signout'),
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
          <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
            {/* <Image
              src="/images/logo/logo.svg"
              alt="MINTOONS Logo - Home"
              width={40}
              height={40}
              className="h-10 w-10"
            /> */}
            <span className="text-xl font-bold text-purple-600">MINTOONS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/pricing"
              className="text-gray-700 transition-colors hover:text-purple-600 dark:text-gray-300"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 transition-colors hover:text-purple-600 dark:text-gray-300"
            >
              Contact
            </Link>
            {session && (
              <Dropdown
                trigger={<span className="text-gray-700 cursor-pointer hover:text-purple-600 dark:text-gray-300">Dashboard</span>}
                items={[
                  { label: 'Main', value: 'main', onClick: () => router.push('/user-dashboard') },
                  { label: 'My Stories', value: 'my-stories', onClick: () => router.push('/my-stories') },
                  { label: 'Create Story', value: 'create-story', onClick: () => router.push('/create-stories') },
                  { label: 'Progress', value: 'progress', onClick: () => router.push('/progress') },
                  { label: 'Profile', value: 'profile', onClick: () => router.push('/profile') },
                ]}
                align="right"
              />
            )}
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
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
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
            role="navigation"
            aria-label="Mobile navigation"
          >
            <nav className="container mx-auto space-y-4 px-4 py-4">
              <Link
                href="/pricing"
                className="block text-gray-700 hover:text-purple-600 dark:text-gray-300"
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="block text-gray-700 hover:text-purple-600 dark:text-gray-300"
              >
                Contact
              </Link>

              {session ? (
                <>
                  <Link
                    href="/user-dashboard"
                    className="block text-gray-700 hover:text-purple-600 dark:text-gray-300"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/my-stories"
                    className="block text-gray-700 hover:text-purple-600 dark:text-gray-300"
                  >
                    My Stories
                  </Link>
                  <Link
                    href="/create-stories"
                    className="block text-gray-700 hover:text-purple-600 dark:text-gray-300"
                  >
                    Create Story
                  </Link>
                  <Link
                    href="/progress"
                    className="block text-gray-700 hover:text-purple-600 dark:text-gray-300"
                  >
                    Progress
                  </Link>
                  <Link
                    href="/profile"
                    className="block text-gray-700 hover:text-purple-600 dark:text-gray-300"
                  >
                    Profile
                  </Link>
                  <Button
                    variant="ghost"
                    size="md"
                    className="block w-full text-left text-red-600"
                    onClick={() => router.push('/api/auth/signout')}
                  >
                    Logout
                  </Button>
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
