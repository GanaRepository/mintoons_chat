// app/(admin)/dashboard/AdminDashboardClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  Shield,
  Activity,
  Crown,
  AlertTriangle,
  Eye,
  UserPlus,
  Calendar,
  Target,
  Award,
  BarChart3,
  PieChart,
  Settings,
  Bell,
  Search,
  Filter,
  RefreshCw,
  Download,
  Flag,
  CheckCircle,
  Clock,
  Star,
} from 'lucide-react';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { RevenueChart } from '@components/analytics/RevenueChart';
import { UserMetrics } from '@components/analytics/UserMetrics';
import { AIUsageChart } from '@components/analytics/AIUsageChart';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';

import { formatDate, formatNumber, formatPrice } from '@utils/formatters';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';

// Fixed Badge variant type to match the actual component
type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'purple';

// Fixed Chart TimeRange type to match actual analytics components
type TimeRange = '7d' | '30d' | '90d' | '1y';

interface AdminDashboardProps {
  statistics: {
    users: {
      total: number;
      newToday: number;
      newThisWeek: number;
      newThisMonth: number;
      activeThisWeek: number;
      growthRate: number;
    };
    stories: {
      total: number;
      thisWeek: number;
      thisMonth: number;
      published: number;
      growthRate: number;
    };
    mentors: {
      total: number;
      active: number;
    };
    revenue: {
      thisMonth: number;
      subscriptions: number;
    };
    moderation: {
      flagged: number;
    };
  };
  recentUsers: any[];
  recentStories: any[];
  topPerformers: any[];
}

export default function AdminDashboardClient({
  statistics,
  recentUsers,
  recentStories,
  topPerformers,
}: AdminDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<
    'overview' | 'analytics' | 'moderation'
  >('overview');

  useEffect(() => {
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page: 'admin-dashboard',
      totalUsers: statistics.users.total,
      totalStories: statistics.stories.total,
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [statistics.users.total, statistics.stories.total]);

  // Fixed formatDate calls with proper format specifier
  const formatDateWithType = (
    date: Date,
    type: 'full' | 'relative' | 'short'
  ) => {
    switch (type) {
      case 'full':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'relative':
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return formatDate(date);
      default:
        return formatDate(date);
    }
  };

  const overviewStats = [
    {
      label: 'Total Users',
      value: formatNumber(statistics.users.total),
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: `+${statistics.users.newThisWeek} this week`,
      trend: statistics.users.growthRate > 0 ? 'up' : 'stable',
      href: '/admin/users',
    },
    {
      label: 'Total Stories',
      value: formatNumber(statistics.stories.total),
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      change: `+${statistics.stories.thisWeek} this week`,
      trend: statistics.stories.growthRate > 0 ? 'up' : 'stable',
      href: '/admin/content-moderation',
    },
    {
      label: 'Revenue',
      value: formatPrice(statistics.revenue.thisMonth),
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500',
      change: `${statistics.revenue.subscriptions} subscriptions`,
      trend: 'up',
      href: '/admin/analytics',
    },
    {
      label: 'Active Mentors',
      value: `${statistics.mentors.active}/${statistics.mentors.total}`,
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      change: 'This week',
      trend: 'stable',
      href: '/admin/mentors',
    },
  ];

  const quickActions = [
    {
      label: 'Create Mentor',
      description: 'Add a new mentor to the platform',
      icon: UserPlus,
      color: 'from-blue-500 to-cyan-500',
      href: '/admin/mentors?action=create',
    },
    {
      label: 'Review Content',
      description: `${statistics.moderation.flagged} items need review`,
      icon: Flag,
      color: 'from-orange-500 to-red-500',
      href: '/admin/content-moderation',
      urgent: statistics.moderation.flagged > 0,
    },
    {
      label: 'Platform Settings',
      description: 'Configure subscription tiers and features',
      icon: Settings,
      color: 'from-purple-500 to-indigo-500',
      href: '/admin/subscription-config',
    },
    {
      label: 'Analytics Report',
      description: 'Generate detailed platform report',
      icon: BarChart3,
      color: 'from-green-500 to-teal-500',
      href: '/admin/analytics',
    },
  ];

  // Helper function to get badge variant for story status
  const getStoryStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 p-8 text-white">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute right-4 top-4 h-32 w-32 rounded-full bg-white/10 blur-xl" />
            <div className="absolute bottom-4 left-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <h1 className="text-3xl font-bold lg:text-4xl">
                    Admin Dashboard
                  </h1>
                </div>

                <p className="text-xl text-gray-300">
                  Manage and monitor the MINTOONS platform
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateWithType(currentTime, 'full')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>
                      {statistics.users.activeThisWeek} active users this week
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-white font-semibold text-gray-900 hover:bg-gray-100"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Export Report
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Platform Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Tabs */}
      <FadeIn delay={0.1}>
        <div className="flex w-fit space-x-1 rounded-lg bg-gray-100 p-1">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'analytics', label: 'Analytics', icon: TrendingUp },
            { key: 'moderation', label: 'Moderation', icon: Shield },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 rounded-md px-6 py-3 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {overviewStats.map((stat, index) => (
              <FadeIn key={stat.label} delay={0.1 * index}>
                <Link href={stat.href}>
                  <Card className="cursor-pointer p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.label}
                        </p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-xs text-gray-500">{stat.change}</p>
                          {stat.trend === 'up' && (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                      <div
                        className={`rounded-2xl bg-gradient-to-br p-3 ${stat.color}`}
                      >
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </FadeIn>
            ))}
          </div>

          {/* Quick Actions */}
          <SlideIn direction="up" delay={0.2}>
            <Card className="p-6">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Target className="h-6 w-6 text-blue-600" />
                Quick Actions
              </h2>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action, index) => (
                  <Link key={action.label} href={action.href}>
                    <div
                      className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                        action.urgent
                          ? 'border-red-300 bg-red-50 hover:border-red-500'
                          : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      {action.urgent && (
                        <div className="absolute -right-2 -top-2">
                          <div className="h-4 w-4 animate-pulse rounded-full bg-red-500" />
                        </div>
                      )}

                      <div className="mb-3 flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}
                        >
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {action.label}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </SlideIn>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Recent Users */}
            <SlideIn direction="up" delay={0.3}>
              <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <Users className="h-5 w-5 text-blue-600" />
                    Recent Users
                  </h3>
                  <Link href="/admin/users">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentUsers.map(user => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                        <span className="text-sm font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>Age {user.age}</span>
                          <Badge variant="default" size="sm">
                            {user.subscriptionTier}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateWithType(
                          new Date(user.createdAt),
                          'relative'
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </SlideIn>

            {/* Recent Stories */}
            <SlideIn direction="up" delay={0.4}>
              <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Recent Stories
                  </h3>
                  <Link href="/admin/content-moderation">
                    <Button variant="outline" size="sm">
                      Moderate
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentStories.slice(0, 5).map(story => (
                    <div
                      key={story._id}
                      className="rounded-lg border border-gray-200 p-3"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="line-clamp-1 font-medium text-gray-900">
                          {story.title}
                        </h4>
                        <Badge
                          variant={getStoryStatusBadgeVariant(story.status)}
                          size="sm"
                        >
                          {story.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          by {story.authorId?.name}, age {story.authorId?.age}
                        </span>
                        <span>
                          {formatDateWithType(
                            new Date(story.createdAt),
                            'relative'
                          )}
                        </span>
                      </div>

                      {story.aiAssessment && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="text-xs font-medium text-green-600">
                              AI Score: {story.aiAssessment.overallScore}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </SlideIn>

            {/* Top Performers */}
            <SlideIn direction="up" delay={0.5}>
              <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Top Performers
                  </h3>
                  <Link href="/admin/users?sort=points">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {topPerformers.map((user, index) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                          index === 0
                            ? 'bg-yellow-500'
                            : index === 1
                              ? 'bg-gray-400'
                              : index === 2
                                ? 'bg-orange-500'
                                : 'bg-blue-500'
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>Age {user.age}</span>
                          <span>Level {user.level || 1}</span>
                          <span>{user.storyCount || 0} stories</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-purple-600">
                          {formatNumber(user.points || 0)}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </SlideIn>
          </div>

          {/* Platform Health */}
          <SlideIn direction="up" delay={0.6}>
            <Card className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                <Activity className="h-5 w-5 text-green-600" />
                Platform Health
              </h3>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mb-1 text-2xl font-bold text-green-600">
                    99.9%
                  </div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mb-1 text-2xl font-bold text-blue-600">
                    1.2s
                  </div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>

                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="mb-1 text-2xl font-bold text-purple-600">
                    4.9
                  </div>
                  <div className="text-sm text-gray-600">User Rating</div>
                </div>
              </div>
            </Card>
          </SlideIn>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Revenue Chart */}
          <SlideIn direction="up" delay={0.1}>
            <Card className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                <DollarSign className="h-5 w-5 text-green-600" />
                Revenue Analytics
              </h3>
              <RevenueChart timeRange="30d" className="h-80" />
            </Card>
          </SlideIn>

          {/* User Growth */}
          <SlideIn direction="up" delay={0.2}>
            <Card className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                <Users className="h-5 w-5 text-blue-600" />
                User Growth Analytics
              </h3>
              <UserMetrics timeRange="30d" className="h-80" />
            </Card>
          </SlideIn>

          {/* AI Usage */}
          <SlideIn direction="up" delay={0.3}>
            <Card className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                <Activity className="h-5 w-5 text-purple-600" />
                AI Usage & Costs
              </h3>
              <AIUsageChart timeRange="30d" className="h-80" />
            </Card>
          </SlideIn>

          {/* Detailed Analytics Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            <SlideIn direction="left" delay={0.4}>
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  User Engagement Metrics
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm font-medium text-gray-700">
                      Daily Active Users
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatNumber(
                        Math.round(statistics.users.activeThisWeek / 7)
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm font-medium text-gray-700">
                      Stories per User
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {(
                        statistics.stories.total /
                        Math.max(statistics.users.total, 1)
                      ).toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm font-medium text-gray-700">
                      Mentor Efficiency
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      {Math.round(
                        (statistics.mentors.active /
                          Math.max(statistics.mentors.total, 1)) *
                          100
                      )}
                      %
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm font-medium text-gray-700">
                      Publication Rate
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                      {Math.round(
                        (statistics.stories.published /
                          Math.max(statistics.stories.total, 1)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </Card>
            </SlideIn>

            <SlideIn direction="right" delay={0.5}>
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Revenue Breakdown
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm font-medium text-gray-700">
                      Monthly Recurring Revenue
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(statistics.revenue.thisMonth)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm font-medium text-gray-700">
                      Active Subscriptions
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {statistics.revenue.subscriptions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm font-medium text-gray-700">
                      Average Revenue per User
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      {formatPrice(
                        statistics.revenue.thisMonth /
                          Math.max(statistics.revenue.subscriptions, 1)
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm font-medium text-gray-700">
                      Conversion Rate
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                      {Math.round(
                        (statistics.revenue.subscriptions /
                          Math.max(statistics.users.total, 1)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </Card>
            </SlideIn>
          </div>
        </div>
      )}

      {/* Moderation Tab */}
      {activeTab === 'moderation' && (
        <div className="space-y-8">
          {/* Moderation Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <FadeIn delay={0.1}>
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <Flag className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Flagged Content
                  </h3>
                </div>
                <div className="mb-2 text-3xl font-bold text-red-600">
                  {statistics.moderation.flagged}
                </div>
                <div className="text-sm text-gray-600">Items need review</div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Auto-Approved
                  </h3>
                </div>
                <div className="mb-2 text-3xl font-bold text-green-600">
                  {statistics.stories.published - statistics.moderation.flagged}
                </div>
                <div className="text-sm text-gray-600">
                  Stories passed AI filter
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Safety Score
                  </h3>
                </div>
                <div className="mb-2 text-3xl font-bold text-blue-600">
                  99.{100 - statistics.moderation.flagged}%
                </div>
                <div className="text-sm text-gray-600">
                  Platform safety rating
                </div>
              </Card>
            </FadeIn>
          </div>

          {/* Recent Moderation Actions */}
          <SlideIn direction="up" delay={0.4}>
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Clock className="h-5 w-5 text-gray-600" />
                  Recent Moderation Actions
                </h3>
                <Link href="/admin/content-moderation">
                  <Button>
                    <Flag className="mr-2 h-4 w-4" />
                    Review All
                  </Button>
                </Link>
              </div>

              {statistics.moderation.flagged === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-gray-900">
                    All Clear!
                  </h4>
                  <p className="text-gray-600">
                    No content flagged for review. The platform is running
                    smoothly.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mock moderation items - in real app, these would come from API */}
                  <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Story flagged by AI
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          "The Great Adventure" - potentially inappropriate
                          language detected
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>by Sarah, age 8</span>
                          <span>2 hours ago</span>
                          <Badge variant="warning" size="sm">
                            High Priority
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          User report
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          Parent reported concerning mentor feedback
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>Mentor: John Smith</span>
                          <span>5 hours ago</span>
                          <Badge variant="error" size="sm">
                            Urgent
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </SlideIn>

          {/* Safety Metrics */}
          <SlideIn direction="up" delay={0.5}>
            <Card className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                <Shield className="h-5 w-5 text-blue-600" />
                Safety & Compliance Metrics
              </h3>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-green-600">
                    100%
                  </div>
                  <div className="text-sm text-gray-600">COPPA Compliance</div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">
                    Privacy Violations
                  </div>
                </div>

                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-purple-600">
                    24/7
                  </div>
                  <div className="text-sm text-gray-600">AI Monitoring</div>
                </div>

                <div className="rounded-lg bg-orange-50 p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-orange-600">
                    &lt;2min
                  </div>
                  <div className="text-sm text-gray-600">Response Time</div>
                </div>
              </div>
            </Card>
          </SlideIn>
        </div>
      )}
    </div>
  );
}
