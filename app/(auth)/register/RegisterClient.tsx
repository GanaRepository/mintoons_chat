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
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Alert } from '@components/ui/alert';
import { userRegistrationSchema } from '@utils/validators';
import { TRACKING_EVENTS, AGE_GROUPS } from '@utils/constants';
import { trackEvent } from '@lib/analytics/tracker';
import { needsParentalConsent, getAgeGroup } from '@utils/age-restrictions';

type RegisterFormData = z.infer<typeof userRegistrationSchema>;

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
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(userRegistrationSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 2, // Changed to number
      parentEmail: '',
      termsAccepted: false,
    },
  });

  const watchedAge = watch('age');
  const watchedEmail = watch('email');
  const watchedPassword = watch('password');
  const needsConsent = needsParentalConsent(Number(watchedAge));
  const ageGroupInfo = getAgeGroup(Number(watchedAge));

  useEffect(() => {
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page: 'register',
    });
  }, []);

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setIsLoading(true);

    try {
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword, // required by backend
          age: data.age, // already a number due to Zod preprocess
          parentEmail: data.parentEmail,
          termsAccepted: data.termsAccepted,
          role: 'child', // default role, must match Zod schema
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
          setError('parentEmail', {
            message: 'Parental email is required for users under 13.',
          });
        } else if (result.error === 'RATE_LIMIT_EXCEEDED') {
          setError('root', {
            message: 'Too many registration attempts. Please wait a few minutes and try again. (For development, clear rate limit in backend cache/database.)',
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
        ageGroup: ageGroupInfo?.label,
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
    const isValid = await trigger(['firstName', 'lastName', 'email']);
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
        ageGroup: ageGroupInfo?.label,
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

  const handleAgeChange = (value: string) => {
    const ageNumber = parseInt(value, 10);
    setValue('age', ageNumber);
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
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${step >= stepNumber
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
                  className={`mx-2 h-0.5 w-8 transition-colors ${step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'
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
                {/* First Name Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      className="pl-10"
                      error={errors.firstName?.message}
                      {...register('firstName')}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="animate-fade-in text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                {/* Last Name Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      className="pl-10"
                      error={errors.lastName?.message}
                      {...register('lastName')}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="animate-fade-in text-sm text-red-600">
                      {errors.lastName.message}
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
                    <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 z-10" />
                    <Select
                      options={ageOptions}
                      value={watchedAge.toString()}
                      onChange={handleAgeChange}
                      error={errors.age?.message}
                      className="pl-10"
                    />
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
                        Perfect! You're in our {ageGroupInfo?.label} group
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
                {/* Parent Email Field (if needed) */}
                {needsConsent && (
                  <div className="space-y-2">
                    <label
                      htmlFor="parentEmail"
                      className="text-sm font-medium text-gray-700"
                    >
                      Parent's Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id="parentEmail"
                        type="email"
                        placeholder="Enter your parent's email"
                        className="pl-10"
                        error={errors.parentEmail?.message}
                        {...register('parentEmail')}
                      />
                    </div>
                    {errors.parentEmail && (
                      <p className="animate-fade-in text-sm text-red-600">
                        {errors.parentEmail.message}
                      </p>
                    )}
                  </div>
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
                      error={errors.confirmPassword?.message}
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
                {/* Terms Agreement */}
                <div className="flex items-start space-x-3">
                  <input
                    id="termsAccepted"
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    {...register('termsAccepted')}
                  />
                  <label
                    htmlFor="termsAccepted"
                    className="text-sm text-gray-700"
                  >
                    I agree to the{' '}
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
                {errors.termsAccepted && (
                  <p className="animate-fade-in text-sm text-red-600">
                    {errors.termsAccepted.message}
                  </p>
                )}
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