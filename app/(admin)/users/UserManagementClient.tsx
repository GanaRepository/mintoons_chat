// app/(admin)/users/UserManagementClient.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  UserCheck,
  Crown,
  Activity,
  Calendar,
  Mail,
  Download,
  RefreshCw,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Dropdown } from '@components/ui/dropdown';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';
import { formatDate, formatNumber } from '@utils/formatters';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import type { User as BaseUser } from '@/types/user';

export type UserWithStats = BaseUser & {
  name: string;
  points: number;
  storyCount: number;
};

interface UserManagementProps {
  users: UserWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    total: number;
    active: number;
    newThisMonth: number;
    averageStories: number;
  };
  filters: {
    status: string;
    tier: string;
    sort: string;
    search: string;
  };
}

type ViewMode = 'grid' | 'list';

export default function UserManagementClient({
  users,
  pagination,
  statistics,
  filters,
}: UserManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(filters.search);

  const updateFilters = (
    newFilters: Partial<typeof filters> & { page?: string }
  ) => {
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

    router.push(`/admin/users?${params.toString()}`);
  };

  const handleSearch = () => {
    updateFilters({ search: searchQuery });
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(`User ${action} successful`);
        router.refresh();

        trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
          // Changed from ADMIN_ACTION
          action: `user_${action}`,
          targetUserId: userId,
        });
      } else {
        throw new Error(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`User ${action} error:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to ${action} ${selectedUsers.length} users?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/bulk-${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers }),
      });

      if (response.ok) {
        toast.success(`Bulk ${action} successful`);
        setSelectedUsers([]);
        router.refresh();
      } else {
        throw new Error(`Bulk ${action} failed`);
      }
    } catch (error) {
      console.error(`Bulk ${action} error:`, error);
      toast.error(`Failed to ${action} users`);
    }
  };

 const getUserStatusColor = (
  user: UserWithStats
): 'success' | 'warning' | 'error' | 'default' => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const isActive = new Date(user.lastActiveDate || 0) >= weekAgo;

  if (!user.isActive) return 'error';
  if (isActive) return 'success';
  return 'warning';
};

const getUserStatusLabel = (user: UserWithStats) => {
  if (!user.isActive) return 'Suspended';

  const daysSinceActive = Math.floor(
    (Date.now() - new Date(user.lastActiveDate || 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysSinceActive <= 1) return 'Active';
  if (daysSinceActive <= 7) return 'Recent';
  return 'Inactive';
};

const userActions = (user: UserWithStats) => [
  {
    label: 'View Profile',
    value: 'view',
    icon: <Eye className="h-4 w-4" />,
    onClick: () => router.push(`/admin/users/${user._id}`),
  },
  {
    label: 'Send Message',
    value: 'message',
    icon: <MessageSquare className="h-4 w-4" />,
    onClick: () => router.push(`/admin/users/${user._id}/message`),
  },
  {
    label: user.isActive ? 'Suspend User' : 'Activate User',
    value: user.isActive ? 'suspend' : 'activate',
    icon: user.isActive ? (
      <Ban className="h-4 w-4" />
    ) : (
      <UserCheck className="h-4 w-4" />
    ),
    onClick: () =>
      handleUserAction(user._id, user.isActive ? 'suspend' : 'activate'),
  },
  {
    label: 'Delete User',
    value: 'delete',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: () => handleUserAction(user._id, 'delete'),
  },
];

  const overviewStats = [
    {
      label: 'Total Users',
      value: formatNumber(statistics.total),
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: `+${statistics.newThisMonth} this month`,
    },
    {
      label: 'Active Users',
      value: formatNumber(statistics.active),
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      change: 'Last 7 days',
    },
    {
      label: 'Avg Stories',
      value: statistics.averageStories,
      icon: Edit,
      color: 'from-purple-500 to-pink-500',
      change: 'Per user',
    },
    {
      label: 'New This Month',
      value: formatNumber(statistics.newThisMonth),
      icon: Calendar,
      color: 'from-orange-500 to-red-500',
      change: 'Registrations',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-xl text-gray-600">
              Manage and monitor platform users
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 lg:mt-0">
            <Button variant="outline" onClick={() => router.refresh()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, index) => (
          <FadeIn key={stat.label} delay={0.1 * index}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
                </div>
                <div
                  className={`rounded-2xl bg-gradient-to-br p-3 ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Filters and Controls */}
      <FadeIn delay={0.2}>
        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {/* Status Filter */}
            <Select
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
              value={filters.status}
              onChange={value => updateFilters({ status: value })}
              className="w-full lg:w-48"
            />

            {/* Tier Filter */}
            <Select
              options={[
                { value: 'all', label: 'All Tiers' },
                { value: 'FREE', label: 'Free' },
                { value: 'BASIC', label: 'Basic' },
                { value: 'PREMIUM', label: 'Premium' },
                { value: 'PRO', label: 'Pro' },
              ]}
              value={filters.tier}
              onChange={value => updateFilters({ tier: value })}
              className="w-full lg:w-48"
            />

            {/* Sort */}
            <Select
              options={[
                { value: 'created', label: 'Recently Created' },
                { value: 'name', label: 'Name A-Z' },
                { value: 'stories', label: 'Most Stories' },
                { value: 'points', label: 'Highest Points' },
                { value: 'active', label: 'Recently Active' },
              ]}
              value={filters.sort}
              onChange={value => updateFilters({ sort: value })}
              className="w-full lg:w-48"
            />

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'} // Changed from primary
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'} // Changed from primary
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Users List/Grid */}
      {users.length === 0 ? (
        <FadeIn delay={0.3}>
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No users found
            </h3>
            <p className="text-gray-600">
              {searchQuery || filters.status !== 'all' || filters.tier !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No users registered yet'}
            </p>
          </Card>
        </FadeIn>
      ) : (
        <div className="space-y-4">
          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <FadeIn>
              <Card className="border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-blue-900">
                      {selectedUsers.length} users selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('activate')}
                    >
                      <UserCheck className="mr-1 h-4 w-4" />
                      Activate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('suspend')}
                    >
                      <Ban className="mr-1 h-4 w-4" />
                      Suspend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUsers([])}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </Card>
            </FadeIn>
          )}

          {viewMode === 'grid' ? (
            // Grid View
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {users.map((user, index) => (
                <SlideIn
                  key={user._id}
                  direction="up"
                  delay={0.1 * (index % 8)}
                >
                  <Card className="p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    {/* Selection checkbox */}
                    <div className="mb-4 flex items-start justify-between">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user._id]);
                          } else {
                            setSelectedUsers(
                              selectedUsers.filter(id => id !== user._id)
                            );
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Badge variant={getUserStatusColor(user)} size="sm">
                        {getUserStatusLabel(user)}
                      </Badge>
                    </div>

                    {/* User Avatar & Info */}
                    <div className="mb-4 text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                        <span className="text-xl font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="mb-1 font-bold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <Badge variant="default" size="sm">
                          {' '}
                          {/* Changed from outline */}
                          Age {user.age}
                        </Badge>
                        <Badge variant="info" size="sm">
                          {user.subscriptionTier}
                        </Badge>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-gray-50 p-2 text-center">
                        <div className="font-bold text-blue-600">
                          {user.storyCount || 0}
                        </div>
                        <div className="text-xs text-gray-600">Stories</div>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-2 text-center">
                        <div className="font-bold text-purple-600">
                          {user.points || 0}
                        </div>
                        <div className="text-xs text-gray-600">Points</div>
                      </div>
                    </div>

                    {/* User Meta */}
                    <div className="mb-4 text-xs text-gray-500">
                      <div className="mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Joined {formatDate(user.createdAt)}{' '}
                          {/* Removed second parameter */}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>
                          Active{' '}
                          {formatDate(user.lastActiveDate || user.createdAt)}{' '}
                          {/* Removed second parameter */}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/admin/users/${user._id}`)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Dropdown
                        trigger={
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        }
                        items={userActions(user)}
                      />
                    </div>
                  </Card>
                </SlideIn>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-3">
              {users.map((user, index) => (
                <SlideIn key={user._id} direction="up" delay={0.05 * index}>
                  <Card className="p-4 transition-shadow duration-300 hover:shadow-md">
                    <div className="flex items-center gap-4">
                      {/* Selection */}
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user._id]);
                          } else {
                            setSelectedUsers(
                              selectedUsers.filter(id => id !== user._id)
                            );
                          }
                        }}
                        className="rounded border-gray-300"
                      />

                      {/* Avatar */}
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                        <span className="text-sm font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-3">
                          <h3 className="truncate font-semibold text-gray-900">
                            {user.name}
                          </h3>
                          <Badge variant={getUserStatusColor(user)} size="sm">
                            {getUserStatusLabel(user)}
                          </Badge>
                          <Badge variant="default" size="sm">
                            {' '}
                            {/* Changed from outline */}
                            {user.subscriptionTier}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="truncate">{user.email}</span>
                          <span>Age {user.age}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.createdAt)}{' '}
                            {/* Removed second parameter */}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden items-center gap-6 text-center lg:flex">
                        <div>
                          <div className="font-bold text-blue-600">
                            {user.storyCount || 0}
                          </div>
                          <div className="text-xs text-gray-600">Stories</div>
                        </div>
                        <div>
                          <div className="font-bold text-purple-600">
                            {user.level || 1}
                          </div>
                          <div className="text-xs text-gray-600">Level</div>
                        </div>
                        <div>
                          <div className="font-bold text-green-600">
                            {formatNumber(user.points || 0)}
                          </div>
                          <div className="text-xs text-gray-600">Points</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/users/${user._id}`)
                          }
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        <Dropdown
                          trigger={
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                          items={userActions(user)}
                        />
                      </div>
                    </div>
                  </Card>
                </SlideIn>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <FadeIn delay={0.4}>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                of {pagination.total} users
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    updateFilters({ page: (pagination.page - 1).toString() })
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum = i + Math.max(1, pagination.page - 2);
                      if (pageNum > pagination.totalPages) return null;

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === pagination.page ? 'primary' : 'outline' // Changed from primary
                          }
                          size="sm"
                          onClick={() =>
                            updateFilters({ page: pageNum.toString() })
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    updateFilters({ page: (pagination.page + 1).toString() })
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
