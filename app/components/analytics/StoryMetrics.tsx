// app/components/analytics/StoryMetrics.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  PenTool,
  Eye,
  Heart,
  Star,
  TrendingUp,
  Target,
  Award,
  Users,
} from 'lucide-react';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { ProgressBar } from '@components/ui/progress-bar';
import { Skeleton } from '@components/ui/skeleton';
import { DashboardChart } from './DashboardChart';
import { formatNumber, formatPercentage, formatDate } from '@utils/formatters';
import {
  calculateAverageRating,
  calculateEngagementRate,
} from '@utils/helpers';
import { getStoryAnalytics } from '@lib/analytics/reporter';
import { STORY_ELEMENTS } from '@utils/constants';
import type { StoryAnalytics, TimeRange } from '@types/analytics';
import type { StoryStatus } from '@types/story';

interface StoryMetricsProps {
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showGenreBreakdown?: boolean;
  className?: string;
}

export const StoryMetrics: React.FC<StoryMetricsProps> = ({
  timeRange = '30d',
  onTimeRangeChange,
  showGenreBreakdown = true,
  className,
}) => {
  const [metrics, setMetrics] = useState<StoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoryMetrics();
  }, [timeRange]);

  const fetchStoryMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getStoryAnalytics(timeRange);
      setMetrics(data);
    } catch (error) {
      // app/components/analytics/StoryMetrics.tsx (continued)
      setError('Failed to load story metrics');
      console.error('Story metrics error:', error);
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
          {error || 'No story metrics available'}
        </div>
      </Card>
    );
  }

  const averageRating = calculateAverageRating(metrics.ratingDistribution);
  const engagementRate = calculateEngagementRate(
    metrics.totalViews,
    metrics.totalLikes,
    metrics.totalComments
  );

  const metricCards = [
    {
      title: 'Total Stories',
      value: metrics.totalStories,
      change:
        ((metrics.totalStories - (metrics.previousTotalStories || 0)) /
          (metrics.previousTotalStories || 1)) *
        100,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Stories Created',
      value: metrics.storiesCreated,
      change:
        ((metrics.storiesCreated - (metrics.previousStoriesCreated || 0)) /
          (metrics.previousStoriesCreated || 1)) *
        100,
      icon: PenTool,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Total Views',
      value: metrics.totalViews,
      change:
        ((metrics.totalViews - (metrics.previousTotalViews || 0)) /
          (metrics.previousTotalViews || 1)) *
        100,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Engagement Rate',
      value: `${engagementRate.toFixed(1)}%`,
      change: engagementRate - (metrics.previousEngagementRate || 0),
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-900/20',
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

      {/* Story Creation Chart */}
      <DashboardChart
        title="Story Creation Over Time"
        data={metrics.creationData}
        chartType="line"
        timeRange={timeRange}
        onTimeRangeChange={onTimeRangeChange}
        showTrend={true}
        height={350}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Story Status Distribution */}
        <Card className="p-6">
          <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Story Status Distribution
          </h4>

          <div className="space-y-4">
            {metrics.statusDistribution?.map((status, index) => {
              const getStatusColor = (status: StoryStatus) => {
                switch (status) {
                  case 'published':
                    return 'success';
                  case 'completed':
                    return 'info';
                  case 'in_progress':
                    return 'warning';
                  case 'draft':
                    return 'default';
                  default:
                    return 'default';
                }
              };

              return (
                <div key={status.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                      {status.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatNumber(status.count)} (
                      {formatPercentage(status.percentage)})
                    </span>
                  </div>
                  <ProgressBar
                    value={status.percentage}
                    max={100}
                    variant={getStatusColor(status.status)}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Average Story Ratings */}
        <Card className="p-6">
          <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Story Quality Metrics
          </h4>

          <div className="space-y-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                {averageRating.toFixed(1)}
              </div>
              <div className="mb-2 flex items-center justify-center space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < Math.floor(averageRating)
                        ? 'fill-current text-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average AI Rating
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {metrics.ratingDistribution?.map((rating, index) => (
                <div key={rating.score} className="flex items-center space-x-3">
                  <div className="w-12 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {rating.score}★
                  </div>
                  <div className="flex-1">
                    <ProgressBar
                      value={rating.count}
                      max={Math.max(
                        ...(metrics.ratingDistribution?.map(r => r.count) || [
                          1,
                        ])
                      )}
                      variant="warning"
                      size="sm"
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                    {rating.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Genre Breakdown */}
      {showGenreBreakdown && (
        <Card className="p-6">
          <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Popular Story Elements
          </h4>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Most Popular Genres */}
            <div>
              <h5 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Top Genres
              </h5>
              <div className="space-y-2">
                {metrics.genreDistribution?.slice(0, 5).map((genre, index) => (
                  <div
                    key={genre.genre}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {genre.genre}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-purple-500"
                          style={{ width: `${genre.percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-xs text-gray-500">
                        {genre.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Characters */}
            <div>
              <h5 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Top Characters
              </h5>
              <div className="space-y-2">
                {metrics.characterDistribution
                  ?.slice(0, 5)
                  .map((character, index) => (
                    <div
                      key={character.character}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {character.character}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${character.percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-gray-500">
                          {character.count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Popular Settings */}
            <div>
              <h5 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Top Settings
              </h5>
              <div className="space-y-2">
                {metrics.settingDistribution
                  ?.slice(0, 5)
                  .map((setting, index) => (
                    <div
                      key={setting.setting}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {setting.setting}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${setting.percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-gray-500">
                          {setting.count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Top Performing Stories */}
      <Card className="p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Top Performing Stories
        </h4>

        <div className="space-y-4">
          {metrics.topStories?.slice(0, 5).map((story, index) => (
            <div
              key={story.id}
              className="flex items-center space-x-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
            >
              <div className="text-2xl font-bold text-gray-400">
                #{index + 1}
              </div>

              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-white">
                  {story.title}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {story.authorName} • {formatDate(story.createdAt)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(story.views)}
                  </div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>

                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(story.likes)}
                  </div>
                  <div className="text-xs text-gray-500">Likes</div>
                </div>

                <div>
                  <div className="flex items-center justify-center space-x-1 text-lg font-semibold text-gray-900 dark:text-white">
                    <Star size={14} className="text-yellow-500" />
                    <span>{story.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
