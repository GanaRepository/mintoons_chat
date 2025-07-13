'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  UserPlus,
  UserMinus,
  Shield,
  MessageCircle,
  Activity,
  Calendar,
  Mail,
  Star,
  Award,
  BookOpen,
  TrendingUp,
  RefreshCw,
  Download,
  ChevronRight,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Modal } from '@components/ui/modal';
import { Dropdown } from '@components/ui/dropdown';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';
import { CreateMentorForm } from '@components/forms/CreateMentorForm';
import { AssignStudentsModal } from '@components/forms/AssignStudentsModal';

import { formatDate, formatNumber } from '@utils/formatters';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import type { User } from '@/types/user';
import type { Comment } from '@/types/comment';

interface MentorManagementProps {
  mentors: User[];
  unassignedStudents: User[];
  recentComments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    total: number;
    active: number;
    unassignedStudents: number;
    avgStudentsPerMentor: number;
    totalStudentsAssigned: number;
  };
  filters: {
    status: string;
    sort: string;
    search: string;
  };
}

export default function MentorManagementClient({
  mentors,
  unassignedStudents,
  recentComments,
  pagination,
  statistics,
  filters
}: MentorManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams?.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to first page when filters change
    if (Object.keys(newFilters).some(key => key !== 'page')) {
      params.delete('page');
    }

    router.push(`/admin/mentors?${params.toString()}`);
  };

  const handleSearch = () => {
    updateFilters({ search: searchQuery });
  };

  const handleMentorAction = async (mentorId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/mentors/${mentorId}/${action}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(`Mentor ${action} successful`);
        router.refresh();
        
        trackEvent(TRACKING_EVENTS.ADMIN_ACTION, {
          action: `mentor_${action}`,
          targetMentorId: mentorId,
        });
      } else {
        throw new Error(`Failed to ${action} mentor`);
      }
    } catch (error) {
      console.error(`Mentor ${action} error:`, error);
      toast.error(`Failed to ${action} mentor`);
    }
  };

  const getMentorStatusColor = (mentor: User) => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const isActive = new Date(mentor.lastActiveAt || 0) >= weekAgo;
    
    if (!mentor.isActive) return 'error';
    if (isActive) return 'success';
    return 'warning';
  };

  const getMentorStatusLabel = (mentor: User) => {
    if (!mentor.isActive) return 'Suspended';
    
    const daysSinceActive = Math.floor(
      (Date.now() - new Date(mentor.lastActiveAt || 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceActive <= 1) return 'Active';
    if (daysSinceActive <= 7) return 'Recent';
    return 'Inactive';
  };

  const mentorActions = (mentor: User) => [
    {
      label: 'View Profile',
      icon: Eye,
      onClick: () => router.push(`/admin/mentors/${mentor._id}`),
    },
    {
      label: 'Assign Students',
      icon: UserPlus,
      onClick: () => {
        setSelectedMentor(mentor);
        setShowAssignModal(true);
      },
    },
    {
      label: 'View Activity',
      icon: Activity,
      onClick: () => router.push(`/admin/mentors/${mentor._id}/activity`),
    },
    {
      label: 'Send Message',
      icon: MessageCircle,
      onClick: () => router.push(`/admin/mentors/${mentor._id}/message`),
    },
    {
      label: mentor.isActive ? 'Suspend' : 'Activate',
      icon: mentor.isActive ? AlertCircle : CheckCircle,
      onClick: () => handleMentorAction(mentor._id, mentor.isActive ? 'suspend' : 'activate'),
      destructive: mentor.isActive,
    },
  ];

  const overviewStats = [
    {
      label: 'Total Mentors',
      value: formatNumber(statistics.total),
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      change: `${statistics.active} active`,
    },
    {
      label: 'Students Assigned',
      value: formatNumber(statistics.totalStudentsAssigned),
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      change: `${statistics.avgStudentsPerMentor} avg per mentor`,
    },
    {
      label: 'Unassigned Students',
      value: formatNumber(statistics.unassignedStudents),
      icon: UserPlus,
      color: statistics.unassignedStudents > 0 ? 'from-orange-500 to-red-500' : 'from-gray-400 to-gray-500',
      change: 'Need mentors',
    },
    {
      label: 'Active This Week',
      value: formatNumber(statistics.active),
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      change: `${Math.round((statistics.active / Math.max(statistics.total, 1)) * 100)}% of total`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Mentor Management
            </h1>
            <p className="text-xl text-gray-600">
              Create, assign, and manage mentors for student guidance
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Mentor
            </Button>
            <Button variant="outline" onClick={() => router.refresh()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <FadeIn key={stat.label} delay={0.1 * index}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Unassigned Students Alert */}
      {statistics.unassignedStudents > 0 && (
        <FadeIn delay={0.2}>
          <Card className="p-6 bg-orange-50 border-orange-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">
                  {statistics.unassignedStudents} Students Need Mentors
                </h3>
                <p className="text-orange-700 text-sm mb-4">
                  These students are waiting to be assigned to mentors for personalized guidance.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => setShowAssignModal(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Assign Students
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/admin/users?status=unassigned')}
                  >
                    View Students
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>
      )}

      {/* Filters and Controls */}
      <FadeIn delay={0.3}>
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search mentors by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="w-full lg:w-48"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="new">New (30 days)</option>
            </Select>

            {/* Sort */}
            <Select
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full lg:w-48"
            >
              <option value="created">Recently Created</option>
              <option value="name">Name A-Z</option>
              <option value="students">Most Students</option>
              <option value="active">Recently Active</option>
            </Select>
          </div>
        </Card>
      </FadeIn>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Mentors List */}
        <div className="lg:col-span-2 space-y-6">
          <FadeIn delay={0.4}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Active Mentors ({mentors.length})
                </h2>
                <Badge variant="info" size="sm">
                  Page {pagination.page} of {pagination.totalPages}
                </Badge>
              </div>

              {mentors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No mentors found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || filters.status !== 'all'
                      ? "Try adjusting your search or filters"
                      : "Create your first mentor to get started"
                    }
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Mentor
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mentors.map((mentor) => (
                    <div key={mentor._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {mentor.firstName?.charAt(0)}{mentor.lastName?.charAt(0)}
                          </span>
                        </div>

                        {/* Mentor Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {mentor.firstName} {mentor.lastName}
                            </h3>
                            <Badge variant={getMentorStatusColor(mentor)} size="sm">
                              {getMentorStatusLabel(mentor)}
                            </Badge>
                            <Badge variant="outline" size="sm">
                              <Shield className="w-3 h-3 mr-1" />
                              Mentor
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {mentor.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Since {formatDate(mentor.mentoringSince || mentor.createdAt, 'short')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {formatDate(mentor.lastActiveAt || mentor.createdAt, 'relative')}
                            </span>
                          </div>

                          {/* Student Assignment Info */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">
                                {mentor.assignedStudents?.length || 0} students assigned
                              </span>
                            </div>
                            {mentor.assignedStudents && mentor.assignedStudents.length > 0 && (
                              <div className="flex -space-x-2">
                                {mentor.assignedStudents.slice(0, 3).map((student: any) => (
                                  <div
                                    key={student._id}
                                    className="w-6 h-6 bg-green-100 border-2 border-white rounded-full flex items-center justify-center"
                                    title={`${student.firstName} ${student.lastName}`}
                                  >
                                    <span className="text-xs font-medium text-green-600">
                                      {student.firstName?.charAt(0)}
                                    </span>
                                  </div>
                                ))}
                                {mentor.assignedStudents.length > 3 && (
                                  <div className="w-6 h-6 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-600">
                                      +{mentor.assignedStudents.length - 3}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/mentors/${mentor._id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Dropdown
                            trigger={
                              <Button variant="outline" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            }
                            items={mentorActions(mentor)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </FadeIn>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <SlideIn direction="right" delay={0.5}>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Recent Mentoring Activity
              </h3>

              {recentComments.length === 0 ? (
                <div className="text-center py-6">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentComments.slice(0, 5).map((comment: any) => (
                    <div key={comment._id} className="p-3 border border-gray-200 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.authorId?.firstName} {comment.authorId?.lastName}
                        </span>
                        <span className="text-gray-500">commented on</span>
                        <span className="font-medium text-blue-600">
                          {comment.storyId?.title}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {comment.content}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt, 'relative')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </SlideIn>

          {/* Quick Actions */}
          <SlideIn direction="right" delay={0.6}>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Mentor
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowAssignModal(true)}
                  disabled={statistics.unassignedStudents === 0}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Students ({statistics.unassignedStudents})
                </Button>
                
                <Link href="/admin/mentors/bulk-import">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Bulk Import Mentors
                  </Button>
                </Link>
                
                <Link href="/admin/analytics?tab=mentors">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </Card>
          </SlideIn>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Mentor"
        size="lg"
      >
        <CreateMentorForm
          onSuccess={() => {
            setShowCreateModal(false);
            router.refresh();
            toast.success('Mentor created successfully!');
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <AssignStudentsModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedMentor(null);
        }}
        mentor={selectedMentor}
        unassignedStudents={unassignedStudents}
        onSuccess={() => {
          setShowAssignModal(false);
          setSelectedMentor(null);
          router.refresh();
          toast.success('Students assigned successfully!');
        }}
      />
    </div>
  );
}