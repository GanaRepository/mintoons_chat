// app/(auth)/login/LoginClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Alert } from '@components/ui/alert';
import { userLoginSchema } from '@utils/validators';
import { TRACKING_EVENTS } from '@utils/constants';
import { trackEvent } from '@lib/analytics/tracker';

type LoginFormData = z.infer<typeof userLoginSchema>;

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const error = searchParams?.get('error');
  const callbackUrl =
    searchParams?.get('callbackUrl') || '/dashboard/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // Track page view
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page: 'login',
      source: searchParams?.get('from') || 'direct',
    });

    // Handle OAuth errors
    if (error) {
      const errorMessages: Record<string, string> = {
        OAuthSignin: 'Error with OAuth provider. Please try again.',
        OAuthCallback: 'OAuth callback error. Please try again.',
        OAuthCreateAccount:
          'Could not create OAuth account. Email may already be in use.',
        EmailCreateAccount:
          'Could not create account. Email may already be in use.',
        Callback: 'Authentication error. Please try again.',
        OAuthAccountNotLinked:
          'Email already associated with another account. Please sign in with your original method.',
        EmailSignin: 'Check your email for a sign-in link.',
        CredentialsSignin:
          'Invalid email or password. Please check your credentials.',
        SessionRequired: 'Please sign in to access this page.',
        default: 'An authentication error occurred. Please try again.',
      };

      toast.error(errorMessages[error] || errorMessages.default);
    }
  }, [error, searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('root', {
            message:
              'Invalid email or password. Please check your credentials and try again.',
          });
        } else {
          setError('root', {
            message: 'Sign in failed. Please try again.',
          });
        }

        trackEvent(TRACKING_EVENTS.ERROR_OCCURRED, {
          type: 'login_failed',
          error: result.error,
          email: data.email,
        });

        return;
      }

      if (result?.ok) {
        // Get updated session to access user info
        const session = await getSession();

        trackEvent(TRACKING_EVENTS.USER_LOGIN, {
          userId: session?.user?._id,
          email: data.email,
          method: 'credentials',
          callbackUrl,
        });

        toast.success('Welcome back! Redirecting to your dashboard...');

        // Redirect after a brief delay for better UX
        setTimeout(() => {
          router.push(callbackUrl);
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('root', {
        message: 'An unexpected error occurred. Please try again.',
      });

      trackEvent(TRACKING_EVENTS.ERROR_OCCURRED, {
        type: 'login_exception',
        error: error instanceof Error ? error.message : 'Unknown error',
        email: data.email,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      trackEvent(TRACKING_EVENTS.BUTTON_CLICK, {
        button: `oauth_${provider}`,
        page: 'login',
      });

      await signIn(provider, {
        callbackUrl,
      });
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast.error(`Failed to sign in with ${provider}. Please try again.`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          Welcome Back!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          Sign in to continue your story writing journey
        </motion.p>
      </div>

      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Global Error */}
            {errors.root && (
              <Alert variant="error" className="animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.root.message}</span>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="animate-fade-in text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="animate-fade-in text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={isSubmitting || isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Sign Up Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-purple-600 transition-colors hover:text-purple-700"
          >
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
