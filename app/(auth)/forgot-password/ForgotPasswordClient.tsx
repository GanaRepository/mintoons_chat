// app/(auth)/forgot-password/ForgotPasswordClient.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Alert } from '@components/ui/alert';
import { validateEmail } from '@utils/validators';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'USER_NOT_FOUND') {
          setError('email', {
            message: 'No account found with this email address.',
          });
        } else {
          setError('root', {
            message:
              result.message || 'Failed to send reset email. Please try again.',
          });
        }
        return;
      }

      setEmailSent(true);
      setSentEmail(data.email);
      toast.success('Password reset email sent successfully!');
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('root', {
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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
            Check Your Email
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600"
          >
            We've sent a password reset link to
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-semibold text-purple-600"
          >
            {sentEmail}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  What's next?
                </h3>
                <div className="space-y-3 text-left text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                      <span className="text-xs font-semibold text-purple-600">
                        1
                      </span>
                    </div>
                    <p>Check your email inbox (and spam folder)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                      <span className="text-xs font-semibold text-purple-600">
                        2
                      </span>
                    </div>
                    <p>Click the reset link in the email</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                      <span className="text-xs font-semibold text-purple-600">
                        3
                      </span>
                    </div>
                    <p>Create your new password</p>
                  </div>
                </div>
              </div>

              <Alert variant="info">
                <Mail className="h-4 w-4" />
                <div>
                  <div className="font-medium">Didn't receive the email?</div>
                  <div className="mt-1 text-sm">
                    The email might take a few minutes to arrive. If you don't
                    see it, check your spam folder or try again.
                  </div>
                </div>
              </Alert>

              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false);
                    setSentEmail('');
                  }}
                  className="w-full"
                >
                  Try a Different Email
                </Button>

                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          Reset Your Password
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          Enter your email address and we'll send you a link to reset your
          password
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
                  placeholder="Enter your email address"
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
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <div className="text-sm text-blue-800">
              <div className="mb-1 font-medium">🔐 Security Notice</div>
              <div>
                For your security, password reset links expire after 1 hour. If
                you don't reset your password within this time, you'll need to
                request a new link.
              </div>
            </div>
          </div>
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
          className="inline-flex items-center font-medium text-purple-600 transition-colors hover:text-purple-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Link>
      </motion.div>
    </div>
  );
}
