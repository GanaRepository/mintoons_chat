// app/components/analytics/UserMetrics.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  UserCheck,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Activity,
} from 'lucide-react';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { ProgressBar } from '@components/ui/progress-bar';
import { Skeleton } from '@components/ui/skeleton';
import { DashboardChart } from './DashboardChart';
import { formatNumber, formatPercentage, formatDate } from '@utils/formatters';
import { calculateGrowthRate, calculateRetentionRate } from '@utils/helpers';
import { getUserAnalytics } from '@lib/analytics/reporter';
import type { UserAnalytics, TimeRange } from '../../../types/analytics';

interface UserMetricsProps {
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showDetailedMetrics?: boolean;
  className?: string;
}

export const UserMetrics: React.FC<UserMetricsProps> = ({
  timeRange = '30d',
  onTimeRangeChange,
  showDetailedMetrics = true,
  className,
}) => {
  const [metrics, setMetrics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserMetrics();
  }, [timeRange]);

  const fetchUserMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getUserAnalytics(timeRange);
      setMetrics(data);
    } catch (error) {
      setError('Failed to load user metrics');
      console.error('User metrics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton lines={3} />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton height="300px" />
        </Card>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          {error || 'No user metrics available'}
        </div>
      </Card>
    );
  }

  const growthRate = calculateGrowthRate(
    metrics.totalUsers,
    metrics.previousPeriodUsers ?? 0
  );
  const retentionRate = calculateRetentionRate(
    metrics.activeUsers,
    metrics.totalUsers
  );

  const metricCards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers,
      change: growthRate,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'New Users',
      value: metrics.newUsers,
      change: calculateGrowthRate(
        metrics.newUsers,
        metrics.previousNewUsers ?? 0
      ),
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers,
      change: calculateGrowthRate(
        metrics.activeUsers,
        metrics.previousActiveUsers ?? 0
      ),
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Retention Rate',
      value: `${retentionRate}%`,
      change: calculateGrowthRate(
        retentionRate,
        metrics.previousRetentionRate || 0
      ),
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;

          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`rounded-lg p-3 ${metric.bgColor}`}>
                    <Icon className={metric.color} size={24} />
                  </div>

                  <Badge
                    variant={isPositive ? 'success' : 'error'}
                    className="flex items-center space-x-1"
                  >
                    <TrendingUp
                      size={12}
                      className={!isPositive ? 'rotate-180' : ''}
                    />
                    <span>{formatPercentage(Math.abs(metric.change))}</span>
                  </Badge>
                </div>

                <div>
                  <h3 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {typeof metric.value === 'number'
                      ? formatNumber(metric.value)
                      : metric.value}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* User Growth Chart */}
      <DashboardChart
        title="User Growth Over Time"
        data={metrics.growthData}
        chartType="area"
        timeRange={timeRange}
        onTimeRangeChange={onTimeRangeChange}
        showTrend={true}
        height={350}
      />

      {showDetailedMetrics && (
        <>
          {/* User Demographics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Age Distribution */}
            <Card className="p-6">
              <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Age Distribution
              </h4>

              <div className="space-y-4">
                {metrics.ageDistribution?.map((ageGroup, index) => (
                  <div key={ageGroup.range} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ages {ageGroup.range}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatNumber(ageGroup.count)} (
                        {formatPercentage(ageGroup.percentage)})
                      </span>
                    </div>
                    <ProgressBar
                      value={ageGroup.percentage}
                      max={100}
                      variant="default"
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* User Roles */}
            <Card className="p-6">
              <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                User Roles
              </h4>

              <div className="space-y-4">
                {metrics.roleDistribution?.map((role, index) => (
                  <div key={role.role} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                        {role.role}s
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatNumber(role.count)} (
                        {formatPercentage(role.percentage)})
                      </span>
                    </div>
                    <ProgressBar
                      value={role.percentage}
                      max={100}
                      variant={
                        role.role === 'child'
                          ? 'success'
                          : role.role === 'mentor'
                            ? 'warning'
                            : 'error'
                      }
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Activity Patterns */}
          <Card className="p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              User Activity Patterns
            </h4>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Peak Hours */}
              <div>
                <h5 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Peak Activity Hours
                </h5>
                <div className="space-y-2">
                  {metrics.peakHours?.slice(0, 3).map((hour, index) => (
                    <div
                      key={hour.hour}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {hour.hour}:00
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-purple-500"
                            style={{ width: `${hour.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatPercentage(hour.percentage)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Active Days */}
              <div>
                <h5 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Most Active Days
                </h5>
                <div className="space-y-2">
                  {metrics.activeDays?.slice(0, 3).map((day, index) => (
                    <div
                      key={day.day}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {day.day}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${day.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatPercentage(day.percentage)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Duration */}
              <div>
                <h5 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Average Session
                </h5>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.averageSessionDuration || 0}m
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Duration
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatNumber(metrics.averageActionsPerSession || 0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Actions per session
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent User Activity */}
          <Card className="p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Recent User Activity
            </h4>

            <div className="space-y-3">
              {metrics.recentActivity?.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                >
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                    <Activity className="text-purple-600" size={16} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.userName} {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>

                  <Badge variant="default" size="sm">
                    {activity.userRole}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
