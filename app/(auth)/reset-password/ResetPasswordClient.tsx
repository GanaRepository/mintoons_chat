// app/(auth)/reset-password/ResetPasswordClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Alert } from '@components/ui/alert';
import { passwordResetConfirmSchema } from '@utils/validators';

// Create the correct type for the reset password form
type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

// Create a schema for this specific form since we're not using the token field in the form
const resetFormSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams?.get('token');
  const email = searchParams?.get('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password');

  useEffect(() => {
    // Validate token on component mount
    const validateToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        });

        if (!response.ok) {
          setTokenValid(false);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenValid(false);
      }
    };

    validateToken();
  }, [token, email]);

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    if (!token || !email) {
      setError('root', {
        type: 'manual',
        message: 'Invalid reset link. Please request a new password reset.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'INVALID_TOKEN') {
          setError('root', {
            type: 'manual',
            message:
              'Reset link has expired or is invalid. Please request a new password reset.',
          });
        } else if (result.error === 'TOKEN_EXPIRED') {
          setError('root', {
            type: 'manual',
            message:
              'Reset link has expired. Please request a new password reset.',
          });
        } else {
          setError('root', {
            type: 'manual',
            message:
              result.message || 'Failed to reset password. Please try again.',
          });
        }
        return;
      }

      setResetSuccess(true);
      toast.success('Password reset successfully!');

      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push('/login?message=password-reset-success');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token UI
  if (!tokenValid) {
    return (
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
          >
            <AlertCircle className="h-8 w-8 text-red-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900"
          >
            Invalid Reset Link
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600"
          >
            This password reset link is invalid or has expired
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
            <div className="space-y-6 text-center">
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <div className="font-medium">
                    Reset link expired or invalid
                  </div>
                  <div className="mt-1 text-sm">
                    Password reset links expire after 1 hour for security
                    reasons. Please request a new password reset link.
                  </div>
                </div>
              </Alert>

              <div className="space-y-3">
                <Link href="/forgot-password">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Request New Reset Link
                  </Button>
                </Link>

                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Success UI
  if (resetSuccess) {
    return (
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
          >
            <CheckCircle className="h-8 w-8 text-green-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900"
          >
            Password Reset Complete!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600"
          >
            Your password has been successfully updated
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
            <div className="space-y-6 text-center">
              <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <div>
                  <div className="font-medium">All set!</div>
                  <div className="mt-1 text-sm">
                    You can now sign in with your new password. You'll be
                    redirected to the login page in a few seconds.
                  </div>
                </div>
              </Alert>

              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Continue to Sign In
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Main reset form
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          Create New Password
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          Choose a strong password for your account
        </motion.p>
        {email && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-purple-600"
          >
            Resetting password for: {email}
          </motion.p>
        )}
      </div>

      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
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

              {/* Password strength indicator */}
              {watchedPassword && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">
                    Password strength:
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`h-1 rounded-full ${
                          watchedPassword.length >= level * 2
                            ? watchedPassword.length >= 8
                              ? 'bg-green-500'
                              : watchedPassword.length >= 6
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  className="pl-10 pr-10"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="animate-fade-in text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-sm text-gray-700">
                <div className="mb-2 font-medium">Password must contain:</div>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        watchedPassword?.length >= 8
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        /[A-Z]/.test(watchedPassword || '')
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        /[a-z]/.test(watchedPassword || '')
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                    One lowercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        /\d/.test(watchedPassword || '')
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                    One number
                  </li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Back to Sign In */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Link
          href="/login"
          className="font-medium text-purple-600 transition-colors hover:text-purple-700"
        >
          Back to Sign In
        </Link>
      </motion.div>
    </div>
  );
}