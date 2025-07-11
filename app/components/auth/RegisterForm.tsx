// app/components/auth/RegisterForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { z, type ZodIssue } from 'zod';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Alert } from '@components/ui/alert';
import { validateUserRegistration } from '@utils/validators';
import { ERROR_MESSAGES } from '@utils/constants';
import { formatErrorMessage } from '@utils/formatters';
import type { RegisterData } from '@/types/auth';
import type { UserRole } from '@/types/user';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: 8,
    role: 'child',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /* ---------- Select options ---------- */
  const ageOptions = Array.from({ length: 17 }, (_, i) => ({
    value: (i + 2).toString(),
    label: `${i + 2} years old`,
  }));

  const roleOptions = [
    { value: 'child', label: 'Young Writer' },
    { value: 'mentor', label: 'Mentor/Teacher' },
  ];

  /* ---------- Submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // ⬇️ safe-parse result gives { success, data?, error? }
      const validation = validateUserRegistration(formData);

      if (!validation.success) {
        const newErrors: Record<string, string> = {};
        validation.error.errors.forEach((err: ZodIssue) => {
          newErrors[String(err.path[0])] = err.message;
        });
        setErrors(newErrors);
        return;
      }

      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data), // validated
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors({
          general: formatErrorMessage(result.error) ?? ERROR_MESSAGES.GENERIC,
        });
      } else {
        router.push('/login?message=registration-success');
      }
    } catch (err) {
      setErrors({ general: ERROR_MESSAGES.NETWORK_ERROR });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- Helpers ---------- */
  const handleChange = (
    field: keyof RegisterData,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  /* ---------- Render ---------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Join MINTOONS
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Start your storytelling adventure today
          </p>
        </div>

        {errors.general && (
          <Alert variant="error" title="Registration Failed">
            {errors.general}
          </Alert>
        )}

        {/* First / Last name */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="text"
            label="First Name"
            value={formData.firstName}
            onChange={e => handleChange('firstName', e.target.value)}
            error={errors.firstName}
            leftIcon={<User size={20} />}
            placeholder="First name"
            required
          />

          <Input
            type="text"
            label="Last Name"
            value={formData.lastName}
            onChange={e => handleChange('lastName', e.target.value)}
            error={errors.lastName}
            leftIcon={<User size={20} />}
            placeholder="Last name"
            required
          />
        </div>

        {/* Email */}
        <Input
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
          error={errors.email}
          leftIcon={<Mail size={20} />}
          placeholder="Enter your email"
          required
        />

        {/* Age / Role */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Age"
            options={ageOptions}
            value={formData.age.toString()}
            onChange={v => handleChange('age', Number(v))}
            error={errors.age}
          />

          <Select
            label="I am a"
            options={roleOptions}
            value={formData.role}
            onChange={v => handleChange('role', v as UserRole)}
            error={errors.role}
          />
        </div>

        {/* Password */}
        <Input
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={formData.password}
          onChange={e => handleChange('password', e.target.value)}
          error={errors.password}
          leftIcon={<Lock size={20} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="transition-colors hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
          placeholder="Create a strong password"
          required
        />

        {/* Confirm password */}
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={e => handleChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          leftIcon={<Lock size={20} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(p => !p)}
              className="transition-colors hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
          placeholder="Confirm your password"
          required
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Create Account
        </Button>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="font-medium text-purple-600 hover:text-purple-700"
          >
            Sign in here
          </button>
        </div>
      </form>
    </motion.div>
  );
};
