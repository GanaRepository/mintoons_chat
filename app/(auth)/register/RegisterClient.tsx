// app/(auth)/register/RegisterClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Alert } from '@components/ui/alert';
import { registerSchema } from '@utils/validators';
import { TRACKING_EVENTS, AGE_GROUPS } from '@utils/constants';
import { trackEvent } from '@lib/analytics/tracker';
import { needsParentalConsent, getAgeGroup } from '@utils/age-restrictions';

type RegisterFormData = z.infer<typeof registerSchema>;

const ageOptions = Array.from({ length: 17 }, (_, i) => ({
  value: (i + 2).toString(),
  label: `${i + 2} years old`,
}));

export default function RegisterClient() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    clearErrors,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
      parentalConsent: false,
    },
  });

  const watchedAge = watch('age');
  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  const needsConsent = watchedAge
    ? needsParentalConsent(parseInt(watchedAge))
    : false;
  const ageGroupInfo = watchedAge ? getAgeGroup(parseInt(watchedAge)) : null;

  useEffect(() => {
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page: 'register',
    });
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          age: parseInt(data.age),
          parentalConsent: data.parentalConsent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'USER_EXISTS') {
          setError('email', {
            message:
              'An account with this email already exists. Please sign in instead.',
          });
        } else if (result.error === 'PARENTAL_CONSENT_REQUIRED') {
          setError('parentalConsent', {
            message: 'Parental consent is required for users under 13.',
          });
        } else {
          setError('root', {
            message: result.message || 'Registration failed. Please try again.',
          });
        }

        trackEvent(TRACKING_EVENTS.ERROR_OCCURRED, {
          type: 'registration_failed',
          error: result.error,
          email: data.email,
          age: data.age,
        });

        return;
      }

      // Track successful registration
      trackEvent(TRACKING_EVENTS.USER_REGISTER, {
        userId: result.user.id,
        email: data.email,
        age: data.age,
        ageGroup: ageGroupInfo?.id,
        needsParentalConsent: needsConsent,
        method: 'credentials',
      });

      toast.success('Account created successfully! Signing you in...');

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        toast.success('Welcome to MINTOONS! 🎉');
        router.push('/dashboard/dashboard');
      } else {
        toast.success('Account created! Please sign in.');
        router.push('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('root', {
        message: 'An unexpected error occurred. Please try again.',
      });

      trackEvent(TRACKING_EVENTS.ERROR_OCCURRED, {
        type: 'registration_exception',
        error: error instanceof Error ? error.message : 'Unknown error',
        email: data.email,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep1 = async () => {
    const isValid = await trigger(['name', 'email']);
    if (isValid) {
      setStep(2);
      trackEvent(TRACKING_EVENTS.FORM_SUBMIT, {
        form: 'register_step1',
        success: true,
      });
    }
  };

  const validateStep2 = async () => {
    const isValid = await trigger(['age']);
    if (isValid) {
      setStep(3);
      trackEvent(TRACKING_EVENTS.FORM_SUBMIT, {
        form: 'register_step2',
        age: watchedAge,
        ageGroup: ageGroupInfo?.id,
        needsConsent,
      });
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
    try {
      trackEvent(TRACKING_EVENTS.BUTTON_CLICK, {
        button: `oauth_${provider}_signup`,
        page: 'register',
      });

      await signIn(provider, {
        callbackUrl: '/dashboard/dashboard',
      });
    } catch (error) {
      console.error(`${provider} sign up error:`, error);
      toast.error(`Failed to sign up with ${provider}. Please try again.`);
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
          Join MINTOONS Today!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          Create your free account and start writing amazing stories
        </motion.p>
      </div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map(stepNumber => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  step >= stepNumber
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > stepNumber ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`mx-2 h-0.5 w-8 transition-colors ${
                    step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

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

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Name Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      error={!!errors.name}
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p className="animate-fade-in text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

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
                      error={!!errors.email}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="animate-fade-in text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={validateStep1}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 2: Age Selection */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    How old are you?
                  </h3>
                  <p className="text-sm text-gray-600">
                    This helps us provide age-appropriate content and features
                  </p>
                </div>

                {/* Age Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="age"
                    className="text-sm font-medium text-gray-700"
                  >
                    Your Age
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Select
                      id="age"
                      placeholder="Select your age"
                      className="pl-10"
                      error={!!errors.age}
                      {...register('age')}
                    >
                      <option value="">Select your age</option>
                      {ageOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {errors.age && (
                    <p className="animate-fade-in text-sm text-red-600">
                      {errors.age.message}
                    </p>
                  )}
                </div>

                {/* Age Group Info */}
                {ageGroupInfo && (
                  <Alert variant="info" className="animate-fade-in">
                    <CheckCircle className="h-4 w-4" />
                    <div>
                      <div className="font-medium">
                        Perfect! You're in our {ageGroupInfo.label} group
                      </div>
                      <div className="mt-1 text-sm">
                        {ageGroupInfo.description}
                      </div>
                    </div>
                  </Alert>
                )}

                {/* COPPA Notice */}
                {needsConsent && (
                  <Alert variant="warning" className="animate-fade-in">
                    <AlertCircle className="h-4 w-4" />
                    <div>
                      <div className="font-medium">
                        Parental Consent Required
                      </div>
                      <div className="mt-1 text-sm">
                        For users under 13, we need parental consent to comply
                        with COPPA regulations. This ensures your safety and
                        privacy online.
                      </div>
                    </div>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={validateStep2}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Password & Consent */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Create Your Password
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose a strong password to keep your account secure
                  </p>
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
                      placeholder="Create a strong password"
                      className="pl-10 pr-10"
                      error={!!errors.password}
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

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10"
                      error={!!errors.confirmPassword}
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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

                {/* Parental Consent Checkbox */}
                {needsConsent && (
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <input
                        id="parentalConsent"
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        {...register('parentalConsent')}
                      />
                      <label
                        htmlFor="parentalConsent"
                        className="text-sm text-gray-700"
                      >
                        I confirm that I have parental consent to create this
                        account and use MINTOONS. By checking this box, I
                        acknowledge that my parent or guardian has reviewed and
                        agreed to the{' '}
                        <Link
                          href="/terms"
                          className="text-purple-600 hover:underline"
                          target="_blank"
                        >
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                          href="/privacy"
                          className="text-purple-600 hover:underline"
                          target="_blank"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </label>
                    </div>
                    {errors.parentalConsent && (
                      <p className="animate-fade-in text-sm text-red-600">
                        {errors.parentalConsent.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Terms Agreement */}
                <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  By creating an account, you agree to our{' '}
                  <Link
                    href="/terms"
                    className="text-purple-600 hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-purple-600 hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                  .
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={isSubmitting || isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          {/* OAuth Providers - Only show on step 1 */}
          {step === 1 && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Or sign up with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignUp('google')}
                  className="w-full"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignUp('github')}
                  className="w-full"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Sign In Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-purple-600 transition-colors hover:text-purple-700"
          >
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
