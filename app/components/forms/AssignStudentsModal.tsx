// app/components/forms/AssignStudentsModal.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Check, Users } from 'lucide-react';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Modal } from '@components/ui/modal';
import { Badge } from '@components/ui/badge';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  storyCount: number;
  subscriptionTier: string;
}

interface AssignStudentsModalProps {
  mentor: User;
  unassignedStudents: User[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignStudentsModal: React.FC<AssignStudentsModalProps> = ({
  mentor,
  unassignedStudents,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = unassignedStudents.filter(
    student =>
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/mentors/${mentor._id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds: selectedStudents,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign students');
      }

      toast.success(
        `Assigned ${selectedStudents.length} students to ${mentor.firstName}`
      );
      onSuccess();
    } catch (error) {
      toast.error('Failed to assign students');
      console.error('Error assigning students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Assign Students to ${mentor.firstName} ${mentor.lastName}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="text-sm text-gray-600">
            Select students to assign to this mentor:
          </div>

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                {searchTerm
                  ? 'No students found matching your search'
                  : 'No unassigned students available'}
              </div>
            ) : (
              filteredStudents.map(student => {
                const isSelected = selectedStudents.includes(student._id);

                return (
                  <motion.div
                    key={student._id}
                    whileHover={{ scale: 1.01 }}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleToggleStudent(student._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                          <span className="text-sm font-bold text-white">
                            {student.firstName.charAt(0)}
                          </span>
                        </div>

                        <div>
                          <div className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {student.email} • Age {student.age}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="default" size="sm">
                              {student.subscriptionTier}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {student.storyCount} stories
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {selectedStudents.length > 0 && (
            <div className="rounded-lg bg-purple-50 p-3">
              <div className="text-sm font-medium text-purple-800">
                Selected: {selectedStudents.length} student
                {selectedStudents.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
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
          <Button
            type="submit"
            disabled={isLoading || selectedStudents.length === 0}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Assigning...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Assign Students ({selectedStudents.length})
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
