'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserPlus, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';

import { Modal } from '@components/ui/modal';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { formatDate } from '@utils/formatters';
import type { User } from '@/types/user';

interface AssignStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: User | null;
  unassignedStudents: User[];
  onSuccess: () => void;
}

export const AssignStudentsModal: React.FC<AssignStudentsModalProps> = ({
  isOpen,
  onClose,
  mentor,
  unassignedStudents,
  onSuccess,
}) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredStudents = unassignedStudents.filter(student =>
    student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignStudents = async () => {
    if (!mentor || selectedStudents.length === 0) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/mentors/${mentor._id}/assign-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedStudents,
          notifyStudents: true,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign students');
      }
    } catch (error) {
      console.error('Error assigning students:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign students');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mentor ? `Assign Students to ${mentor.firstName} ${mentor.lastName}` : 'Assign Students'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Count */}
        {selectedStudents.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="font-medium text-blue-900">
              {selectedStudents.length} students selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStudents([])}
            >
              Clear Selection
            </Button>
          </div>
        )}

        {/* Students List */}
        <div className="max-h-96 overflow-y-auto space-y-3">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchQuery ? 'No students found matching your search' : 'No unassigned students available'}
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <motion.div
                key={student._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedStudents.includes(student._id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleStudent(student._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </h4>
                      <Badge variant="outline" size="sm">
                        Age {student.age}
                      </Badge>
                      <Badge variant="info" size="sm">
                        {student.subscriptionTier}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{student.email}</span>
                      <span>{student.storyCount || 0} stories</span>
                      <span>Joined {formatDate(student.createdAt, 'relative')}</span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {selectedStudents.includes(student._id) ? (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <UserMinus className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignStudents}
            disabled={isLoading || selectedStudents.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {isLoading ? 'Assigning...' : `Assign ${selectedStudents.length} Students`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};