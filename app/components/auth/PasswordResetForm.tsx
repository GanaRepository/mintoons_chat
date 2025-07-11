// app/components/auth/PasswordResetForm.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Alert } from '@components/ui/alert';
import { validateEmailOnly } from '@utils/validators';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@utils/constants';
import { formatErrorMessage } from '@utils/formatters';

interface PasswordResetFormProps {
  onBackToLogin?: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate email
      validateEmailOnly(email);

      // API call to request password reset
      const response = await fetch('/api/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(formatErrorMessage(result.error) || ERROR_MESSAGES.GENERIC);
      } else {
        setSuccess(true);
        setSuccessMessage(SUCCESS_MESSAGES.EMAIL_SENT);
      }
    } catch (error) {
      setError(ERROR_MESSAGES.INVALID_EMAIL);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto w-full max-w-md text-center"
      >
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
          <Mail size={48} className="mx-auto mb-4 text-green-600" />
          <h3 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-200">
            Check Your Email
          </h3>
          <p className="mb-4 text-green-700 dark:text-green-300">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            If you don't see the email, check your spam folder.
          </p>
        </div>

        {onBackToLogin && (
          <Button variant="ghost" onClick={onBackToLogin} className="mt-4">
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        {error && (
          <Alert variant="error" title="Reset Failed">
            {error}
          </Alert>
        )}

        <Input
          type="email"
          label="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          leftIcon={<Mail size={20} />}
          placeholder="Enter your email address"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Send Reset Link
        </Button>

        {onBackToLogin && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBackToLogin}
            className="w-full"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </Button>
        )}
      </form>
    </motion.div>
  );
};
