// app/(admin)/mentors/MentorManagementClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  MessageCircle,
  Trash2,
  Edit,
  Eye,
  UserCheck,
} from 'lucide-react';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Dropdown } from '@components/ui/dropdown';
import { CreateMentorForm } from '@components/forms/CreateMentorForm';
import { AssignStudentsModal } from '@components/forms/AssignStudentsModal';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';
import { formatDate, formatNumber } from '@utils/formatters';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import { User } from '@/types/user'; // Import your actual User type
import { Comment } from '@/types/comment'; // Import your actual Comment type

interface PaginationType {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StatisticsType {
  total: number;
  active: number;
  unassignedStudents: number;
  avgStudentsPerMentor: number;
  totalStudentsAssigned: number;
}

interface FiltersType {
  status: string;
  sort: string;
  search: string;
}

interface MentorManagementClientProps {
  mentors: User[]; // Use your actual User type
  unassignedStudents: User[]; // Use your actual User type
  recentComments: Comment[]; // Use your actual Comment type
  pagination: PaginationType;
  statistics: StatisticsType;
  filters: FiltersType;
}

export default function MentorManagementClient({
  mentors,
  unassignedStudents,
  recentComments,
  pagination,
  statistics,
  filters,
}: MentorManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState(filters.status);
  const [sortBy, setSortBy] = useState(filters.sort);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);

  useEffect(() => {
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page: 'mentor-management',
      totalMentors: statistics.total,
      activeMentors: statistics.active,
    });
  }, [statistics.total, statistics.active]);

  // Helper function to determine if mentor is active
  const isMentorActive = (mentor: User): boolean => {
    // Use User type
    if (!mentor.lastActiveDate) return false;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(mentor.lastActiveDate) >= weekAgo;
  };

  // Helper function to get badge variant
  const getBadgeVariant = (condition: boolean): 'success' | 'default' => {
    return condition ? 'success' : 'default';
  };

  // Helper function to format mentor status
  const getMentorStatus = (
    mentor: User
  ): { text: string; variant: 'success' | 'warning' | 'default' } => {
    const isActive = isMentorActive(mentor);
    const hasStudents = (mentor.assignedStudents?.length || 0) > 0;

    if (isActive && hasStudents) {
      return { text: 'Active', variant: 'success' };
    } else if (isActive && !hasStudents) {
      return { text: 'Available', variant: 'warning' };
    } else {
      return { text: 'Inactive', variant: 'default' };
    }
  };

  const handleAssignStudents = (mentor: User) => {
    setSelectedMentor(mentor);
    setShowAssignModal(true);
  };

  const statusOptions = [
    { value: 'all', label: 'All Mentors' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'new', label: 'New' },
  ];

  const sortOptions = [
    { value: 'created', label: 'Newest First' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'students', label: 'Most Students' },
    { value: 'active', label: 'Recently Active' },
  ];

  // URL update function
  const updateFilters = (newFilters: Partial<FiltersType>) => {
    const params = new URLSearchParams();
    if (newFilters.search || searchTerm)
      params.set('search', newFilters.search || searchTerm);
    if (newFilters.status || statusFilter)
      params.set('status', newFilters.status || statusFilter);
    if (newFilters.sort || sortBy)
      params.set('sort', newFilters.sort || sortBy);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-8 text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute right-4 top-4 h-32 w-32 rounded-full bg-white/10 blur-xl" />
            <div className="absolute bottom-4 left-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👨‍🏫</span>
                  <h1 className="text-3xl font-bold lg:text-4xl">
                    Mentor Management
                  </h1>
                </div>

                <p className="text-xl text-gray-300">
                  Manage mentors and assign them to students
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{statistics.total} mentors total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>{statistics.active} active this week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {statistics.unassignedStudents} unassigned students
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-white font-semibold text-gray-900 hover:bg-gray-100"
                  onClick={() => setShowCreateForm(true)}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Add Mentor
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <FadeIn delay={0.1}>
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Total Mentors
              </h3>
            </div>
            <div className="mb-2 text-3xl font-bold text-blue-600">
              {statistics.total}
            </div>
            <div className="text-sm text-gray-600">Registered on platform</div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Active Mentors
              </h3>
            </div>
            <div className="mb-2 text-3xl font-bold text-green-600">
              {statistics.active}
            </div>
            <div className="text-sm text-gray-600">Active this week</div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Unassigned Students
              </h3>
            </div>
            <div className="mb-2 text-3xl font-bold text-orange-600">
              {statistics.unassignedStudents}
            </div>
            <div className="text-sm text-gray-600">Need mentors</div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4}>
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Avg. Students/Mentor
              </h3>
            </div>
            <div className="mb-2 text-3xl font-bold text-purple-600">
              {statistics.avgStudentsPerMentor}
            </div>
            <div className="text-sm text-gray-600">Current ratio</div>
          </Card>
        </FadeIn>
      </div>

      {/* Filters and Search */}
      <FadeIn delay={0.5}>
        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search mentors by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    updateFilters({ search: searchTerm });
                  }
                }}
                icon={Search}
              />
            </div>

            <div className="flex gap-3">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={value => {
                  setStatusFilter(value);
                  updateFilters({ status: value });
                }}
                placeholder="Filter by status"
              />

              <Select
                options={sortOptions}
                value={sortBy}
                onChange={value => {
                  setSortBy(value);
                  updateFilters({ sort: value });
                }}
                placeholder="Sort by"
              />

              <Button
                variant="outline"
                onClick={() => updateFilters({ search: searchTerm })}
              >
                <Filter className="mr-2 h-4 w-4" />
                Apply
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Mentors List */}
        <div className="space-y-6 lg:col-span-2">
          <SlideIn direction="left" delay={0.6}>
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Mentors ({mentors.length})
                </h3>
              </div>

              <div className="space-y-4">
                {mentors.map((mentor, index) => {
                  const status = getMentorStatus(mentor);

                  return (
                    <motion.div
                      key={mentor._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                            <span className="font-bold text-white">
                              {mentor.firstName.charAt(0)}
                              {mentor.lastName.charAt(0)}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900">
                              {mentor.firstName} {mentor.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {mentor.email}
                            </p>
                            <div className="mt-1 flex items-center gap-3">
                              <Badge variant={status.variant} size="sm">
                                {status.text}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {mentor.assignedStudents?.length || 0} students
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(mentor.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignStudents(mentor)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign
                          </Button>

                          <Dropdown
                            trigger={
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            }
                            items={[
                              {
                                label: 'View Profile',
                                value: 'view',
                                icon: <Eye className="h-4 w-4" />,
                                onClick: () => {
                                  window.open(
                                    `/admin/users/${mentor._id}`,
                                    '_blank'
                                  );
                                },
                              },
                              {
                                label: 'Send Email',
                                value: 'email',
                                icon: <Mail className="h-4 w-4" />,
                                onClick: () => {
                                  window.open(
                                    `mailto:${mentor.email}`,
                                    '_blank'
                                  );
                                },
                              },
                              {
                                label: 'Edit Details',
                                value: 'edit',
                                icon: <Edit className="h-4 w-4" />,
                                onClick: () => {
                                  // Handle edit
                                },
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
                  <div className="text-sm text-gray-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{' '}
                    of {pagination.total} mentors
                  </div>

                  <div className="flex gap-2">
                    {pagination.page > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateFilters({ search: searchTerm })}
                      >
                        Previous
                      </Button>
                    )}

                    {pagination.page < pagination.totalPages && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateFilters({ search: searchTerm })}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </SlideIn>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Unassigned Students */}
          <SlideIn direction="right" delay={0.7}>
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Unassigned Students
                </h3>
                <Badge variant="warning" size="sm">
                  {unassignedStudents.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {unassignedStudents.slice(0, 5).map(student => (
                  <div
                    key={student._id}
                    className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                      <span className="text-xs font-bold text-white">
                        {student.firstName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-gray-600">
                        Age {student.age} • {student.storyCount} stories
                      </div>
                    </div>
                  </div>
                ))}

                {unassignedStudents.length > 5 && (
                  <div className="pt-2 text-center">
                    <Button variant="outline" size="sm">
                      View All ({unassignedStudents.length})
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </SlideIn>

          {/* Recent Mentor Activity */}
          <SlideIn direction="right" delay={0.8}>
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Activity
                </h3>
              </div>

              <div className="space-y-4">
                {recentComments.slice(0, 5).map(comment => (
                  <div key={comment._id} className="text-sm">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                        <MessageCircle className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">
                          <span className="font-medium">
                            {comment.authorName}
                          </span>
                          commented on{' '}
                          <span className="font-medium">{comment.storyId}</span>
                        </p>
                        <p className="mt-1 line-clamp-2 text-gray-600">
                          {comment.content}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </SlideIn>
        </div>
      </div>

      {/* Modals */}
      {showCreateForm && (
        <CreateMentorForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            window.location.reload();
          }}
        />
      )}

      {showAssignModal && selectedMentor && (
        <AssignStudentsModal
          mentor={selectedMentor}
          unassignedStudents={unassignedStudents}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedMentor(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setSelectedMentor(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
