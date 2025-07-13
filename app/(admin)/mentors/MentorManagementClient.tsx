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
  UserCheck
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

// Fixed User interface with correct property names
interface UserType {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  role: 'child' | 'mentor' | 'admin';
  subscriptionTier: string;
  isActive: boolean;
  storyCount: number;
  level?: number;
  points?: number;
  lastActiveDate?: Date; // Changed from lastActiveAt to match model
  createdAt: Date;
  assignedStudents?: UserType[];
}

// Fixed Comment interface
interface CommentType {
  id: string;
  storyId: {
    id: string;
    title: string;
  };
  authorId: {
    id: string;
    firstName: string;
    lastName: string;
  };
  authorName?: string;
  authorRole: 'mentor' | 'admin';
  content: string;
  type: string;
  createdAt: Date;
}

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
  mentors: UserType[];
  unassignedStudents: UserType[];
  recentComments: CommentType[];
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
  filters
}: MentorManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState(filters.status);
  const [sortBy, setSortBy] = useState(filters.sort);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<UserType | null>(null);

  useEffect(() => {
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page: 'mentor-management',
      totalMentors: statistics.total,
      activeMentors: statistics.active,
    });
  }, [statistics.total, statistics.active]);

  // Helper function to determine if mentor is active
  const isMentorActive = (mentor: UserType): boolean => {
    if (!mentor.lastActiveDate) return false;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(mentor.lastActiveDate) >= weekAgo;
  };

  // Helper function to get badge variant
  const getBadgeVariant = (condition: boolean): 'success' | 'default' => {
    return condition ? 'success' : 'default';
  };

  // Helper function to format mentor status
  const getMentorStatus = (mentor: UserType): { text: string; variant: 'success' | 'warning' | 'default' } => {
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

  const handleAssignStudents = (mentor: UserType) => {
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
    if (newFilters.search || searchTerm) params.set('search', newFilters.search || searchTerm);
    if (newFilters.status || statusFilter) params.set('status', newFilters.status || statusFilter);
    if (newFilters.sort || sortBy) params.set('sort', newFilters.sort || sortBy);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👨‍🏫</span>
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    Mentor Management
                  </h1>
                </div>
                
                <p className="text-xl text-gray-300">
                  Manage mentors and assign them to students
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{statistics.total} mentors total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>{statistics.active} active this week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{statistics.unassignedStudents} unassigned students</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                  onClick={() => setShowCreateForm(true)}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add Mentor
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FadeIn delay={0.1}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Mentors</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {statistics.total}
            </div>
            <div className="text-sm text-gray-600">Registered on platform</div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Active Mentors</h3>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {statistics.active}
            </div>
            <div className="text-sm text-gray-600">Active this week</div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Unassigned Students</h3>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {statistics.unassignedStudents}
            </div>
            <div className="text-sm text-gray-600">Need mentors</div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Avg. Students/Mentor</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {statistics.avgStudentsPerMentor}
            </div>
            <div className="text-sm text-gray-600">Current ratio</div>
          </Card>
        </FadeIn>
      </div>

      {/* Filters and Search */}
      <FadeIn delay={0.5}>
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search mentors by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
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
                onChange={(value) => {
                  setStatusFilter(value);
                  updateFilters({ status: value });
                }}
                placeholder="Filter by status"
              />
              
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={(value) => {
                  setSortBy(value);
                  updateFilters({ sort: value });
                }}
                placeholder="Sort by"
              />
              
              <Button 
                variant="outline"
                onClick={() => updateFilters({ search: searchTerm })}
              >
                <Filter className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Mentors List */}
        <div className="lg:col-span-2 space-y-6">
          <SlideIn direction="left" delay={0.6}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Mentors ({mentors.length})
                </h3>
              </div>

              <div className="space-y-4">
                {mentors.map((mentor, index) => {
                  const status = getMentorStatus(mentor);
                  
                  return (
                    <motion.div
                      key={mentor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {mentor.firstName.charAt(0)}{mentor.lastName.charAt(0)}
                            </span>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {mentor.firstName} {mentor.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{mentor.email}</p>
                            <div className="flex items-center gap-3 mt-1">
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
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign
                          </Button>
                          
                          <Dropdown
                            trigger={
                              <Button variant="outline" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            }
                            items={[
                              {
                                label: 'View Profile',
                                value: 'view',
                                icon: <Eye className="w-4 h-4" />,
                                onClick: () => {
                                  window.open(`/admin/users/${mentor.id}`, '_blank');
                                }
                              },
                              {
                                label: 'Send Email',
                                value: 'email',
                                icon: <Mail className="w-4 h-4" />,
                                onClick: () => {
                                  window.open(`mailto:${mentor.email}`, '_blank');
                                }
                              },
                              {
                                label: 'Edit Details',
                                value: 'edit',
                                icon: <Edit className="w-4 h-4" />,
                                onClick: () => {
                                  // Handle edit
                                }
                              }
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
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} mentors
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Unassigned Students
                </h3>
                <Badge variant="warning" size="sm">
                  {unassignedStudents.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {unassignedStudents.slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {student.firstName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-gray-600">
                        Age {student.age} • {student.storyCount} stories
                      </div>
                    </div>
                  </div>
                ))}

                {unassignedStudents.length > 5 && (
                  <div className="text-center pt-2">
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
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Activity
                </h3>
              </div>

              <div className="space-y-4">
                {recentComments.slice(0, 5).map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <MessageCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">
                          <span className="font-medium">
                            {comment.authorId.firstName} {comment.authorId.lastName}
                          </span>{' '}
                          commented on{' '}
                          <span className="font-medium">"{comment.storyId.title}"</span>
                        </p>
                        <p className="text-gray-600 mt-1 line-clamp-2">
                          {comment.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
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