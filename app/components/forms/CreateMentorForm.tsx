'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, FileText, Send } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Switch } from '@components/ui/switch';
import { FormField } from '@components/forms/FormField';

interface CreateMentorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateMentorForm: React.FC<CreateMentorFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    sendInviteEmail: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();

        if (!formData.sendInviteEmail && result.tempPassword) {
          toast.success(
            `Mentor created! Temporary password: ${result.tempPassword}`
          );
        } else {
          toast.success('Mentor created and invitation email sent!');
        }

        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create mentor');
      }
    } catch (error) {
      console.error('Error creating mentor:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create mentor'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      {/* Name Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="First Name"
          icon={User}
          error={errors.firstName}
          required
        >
          <Input
            type="text"
            value={formData.firstName}
            onChange={e =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            placeholder="Enter first name"
            disabled={isLoading}
          />
        </FormField>

        <FormField
          label="Last Name"
          icon={User}
          error={errors.lastName}
          required
        >
          <Input
            type="text"
            value={formData.lastName}
            onChange={e =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            placeholder="Enter last name"
            disabled={isLoading}
          />
        </FormField>
      </div>

      {/* Email */}
      <FormField
        label="Email Address"
        icon={Mail}
        error={errors.email}
        required
      >
        <Input
          type="email"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          placeholder="mentor@example.com"
          disabled={isLoading}
        />
      </FormField>

      {/* Bio */}
      <FormField
        label="Bio (Optional)"
        icon={FileText}
        description="A brief description of the mentor's background and expertise"
      >
        <Textarea
          value={formData.bio}
          onChange={e => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Experienced educator with 5+ years in creative writing..."
          rows={3}
          disabled={isLoading}
        />
      </FormField>

      {/* Send Invitation Email */}
      <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
        <div className="flex items-center gap-3">
          <Send className="h-5 w-5 text-blue-600" />
          <div>
            <div className="font-medium text-gray-900">
              Send Invitation Email
            </div>
            <div className="text-sm text-gray-600">
              Automatically send login credentials to the new mentor
            </div>
          </div>
        </div>
        <Switch
          checked={formData.sendInviteEmail}
          onChange={checked =>
            setFormData({ ...formData, sendInviteEmail: checked })
          }
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {isLoading ? 'Creating...' : 'Create Mentor'}
        </Button>
      </div>
    </motion.form>
  );
};
