// app/components/forms/CreateMentorForm.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Mail, User, Calendar } from 'lucide-react';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Modal } from '@components/ui/modal';
import { toast } from 'react-hot-toast';

interface CreateMentorFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateMentorForm: React.FC<CreateMentorFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    bio: '',
    qualifications: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/mentors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          role: 'mentor',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create mentor');
      }

      toast.success('Mentor created successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create mentor');
      console.error('Error creating mentor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen onClose={onClose} title="Create New Mentor">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              First Name
            </label>
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter first name"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter last name"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Age
          </label>
          <Input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Enter age"
            min="18"
            max="100"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about this mentor..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Qualifications
          </label>
          <textarea
            name="qualifications"
            value={formData.qualifications}
            onChange={handleInputChange}
            placeholder="Education, experience, certifications..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Mentor
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
