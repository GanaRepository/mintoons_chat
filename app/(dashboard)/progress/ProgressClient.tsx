// app/(dashboard)/progress/ProgressClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Award,
  BookOpen,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Star,
  Fire,
  Zap,
  Trophy,
  Clock,
  Edit,
  Users,
  Heart,
  Brain,
  Sparkles,
  Crown,
} from 'lucide-react';

import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { ProgressBar } from '@components/ui/progress-bar';
import { Button } from '@components/ui/button';
import { AchievementBadge } from '@components/gamification/AchievementBadge';
import { StreakCounter } from '@components/gamification/StreakCounter';
import { LevelIndicator } from '@components/gamification/LevelIndicator';
import { StoryMetrics } from '@components/analytics/StoryMetrics';
import { UserMetrics } from '@components/analytics/UserMetrics';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';

import { formatNumber, formatDate } from '@utils/formatters';
import { calculateLevel, getNextLevelRequirement } from '@utils/helpers';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import type { User } from '@/types/user';
import type { Story } from '@/types/story';

interface ProgressProps {
  user: User;
  stories: Story[];
  analytics: any[];
  statistics: {
    totalStories: number;
    publishedStories: number;
    draftStories: number;
    totalWords: number;
    averageWordsPerStory: number;
    avgGrammarScore: number;
    avgCreativityScore: number;
    avgOverallScore: number;
    genreStats: Record<string, number>;
    recentStories: number;
    writingDays: number;
  };
}

export default function ProgressClient({
  user,
  stories,
  analytics,
  statistics,
}: ProgressProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'achievements' | 'analytics'
  >('overview');

  useEffect(() => {
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page: 'progress',
      totalStories: statistics.totalStories,
      userLevel: user.level || 1,
    });
  }, [statistics.totalStories, user.level]);

  const currentLevel = user.level || 1;
  const currentPoints = user.points || 0;
  const nextLevelPoints = getNextLevelRequirement(currentLevel);
  const levelProgress = (currentPoints % 1000) / 10; // Assuming 1000 points per level

  // Mock achievements data (would come from user.achievements in real app)
  const achievements = [
    {
      id: 'first_story',
      title: 'First Story',
      description: 'Completed your very first story!',
      icon: '🎉',
      unlockedAt:
        statistics.totalStories > 0 ? new Date(Date.now() - 86400000) : null,
      category: 'milestone',
    },
    {
      id: 'prolific_writer',
      title: 'Prolific Writer',
      description: 'Written 10 amazing stories',
      icon: '📚',
      unlockedAt:
        statistics.totalStories >= 10 ? new Date(Date.now() - 172800000) : null,
      category: 'milestone',
    },
    {
      id: 'grammar_master',
      title: 'Grammar Master',
      description: 'Achieved 90%+ grammar score',
      icon: '✏️',
      unlockedAt:
        statistics.avgGrammarScore >= 90
          ? new Date(Date.now() - 259200000)
          : null,
      category: 'skill',
    },
    {
      id: 'creative_genius',
      title: 'Creative Genius',
      description: 'Achieved 95%+ creativity score',
      icon: '🎨',
      unlockedAt:
        statistics.avgCreativityScore >= 95
          ? new Date(Date.now() - 345600000)
          : null,
      category: 'skill',
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Maintained a 7-day writing streak',
      icon: '🔥',
      unlockedAt:
        (user.streak?.longest || 0) >= 7
          ? new Date(Date.now() - 432000000)
          : null,
      category: 'engagement',
    },
    {
      id: 'explorer',
      title: 'Genre Explorer',
      description: 'Written stories in 5 different genres',
      icon: '🗺️',
      unlockedAt:
        Object.keys(statistics.genreStats).length >= 5
          ? new Date(Date.now() - 518400000)
          : null,
      category: 'exploration',
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  const overviewStats = [
    {
      label: 'Total Stories',
      value: statistics.totalStories,
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      change: `+${statistics.recentStories} this month`,
    },
    {
      label: 'Words Written',
      value: formatNumber(statistics.totalWords),
      icon: Edit,
      color: 'from-green-500 to-emerald-500',
      change: `${statistics.averageWordsPerStory} avg per story`,
    },
    {
      label: 'Writing Level',
      value: currentLevel,
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      change: `${formatNumber(currentPoints)} points`,
    },
    {
      label: 'Achievement Score',
      value: `${statistics.avgOverallScore}%`,
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      change: 'Average AI score',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <FadeIn>
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Writing Progress
          </h1>
          <p className="text-xl text-gray-600">
            Track your writing journey and celebrate your achievements
          </p>
        </div>
      </FadeIn>

      {/* Tabs */}
      <FadeIn delay={0.1}>
        <div className="mb-8 flex w-fit space-x-1 rounded-lg bg-gray-100 p-1">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'achievements', label: 'Achievements', icon: Award },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 rounded-md px-6 py-3 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {overviewStats.map((stat, index) => (
              <FadeIn key={stat.label} delay={0.1 * index}>
                <Card className="p-6 transition-shadow duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {stat.change}
                      </p>
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

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Progress */}
            <div className="space-y-6 lg:col-span-2">
              {/* Level Progress */}
              <SlideIn direction="up" delay={0.2}>
                <LevelIndicator
                  currentLevel={currentLevel}
                  currentPoints={currentPoints}
                  pointsToNextLevel={nextLevelPoints - currentPoints}
                  className="bg-gradient-to-br from-purple-50 to-pink-50"
                />
              </SlideIn>

              {/* Writing Skills */}
              <SlideIn direction="up" delay={0.3}>
                <Card className="p-6">
                  <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Writing Skills Assessment
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Grammar & Mechanics
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {statistics.avgGrammarScore}%
                        </span>
                      </div>
                      <ProgressBar
                        value={statistics.avgGrammarScore}
                        max={100}
                        variant="blue"
                        size="md"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Creativity & Imagination
                        </span>
                        <span className="text-sm font-bold text-purple-600">
                          {statistics.avgCreativityScore}%
                        </span>
                      </div>
                      <ProgressBar
                        value={statistics.avgCreativityScore}
                        max={100}
                        variant="purple"
                        size="md"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Overall Quality
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          {statistics.avgOverallScore}%
                        </span>
                      </div>
                      <ProgressBar
                        value={statistics.avgOverallScore}
                        max={100}
                        variant="green"
                        size="md"
                      />
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium text-gray-900">
                      💡 Improvement Tips:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {statistics.avgGrammarScore < 80 && (
                        <li>• Focus on sentence structure and punctuation</li>
                      )}
                      {statistics.avgCreativityScore < 80 && (
                        <li>• Try exploring new genres and character types</li>
                      )}
                      {statistics.avgOverallScore < 85 && (
                        <li>
                          • Practice writing longer, more detailed stories
                        </li>
                      )}
                      <li>• Keep writing consistently to improve all skills</li>
                    </ul>
                  </div>
                </Card>
              </SlideIn>

              {/* Recent Activity */}
              <SlideIn direction="up" delay={0.4}>
                <Card className="p-6">
                  <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Recent Writing Activity
                  </h3>

                  {stories.slice(0, 5).map((story, index) => (
                    <div
                      key={story.id}
                      className="flex items-center gap-4 border-b border-gray-100 py-3 last:border-0"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          story.status === 'published'
                            ? 'bg-green-100 text-green-600'
                            : story.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <BookOpen className="h-5 w-5" />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {story.title}
                        </h4>
                        <div className="mt-1 flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            {formatDate(story.createdAt)}
                          </span>
                          <Badge
                            variant={
                              story.status === 'published'
                                ? 'success'
                                : story.status === 'draft'
                                  ? 'warning'
                                  : 'default'
                            }
                            size="sm"
                          >
                            {story.status}
                          </Badge>
                          {story.wordCount && (
                            <span className="text-sm text-gray-500">
                              {formatNumber(story.wordCount)} words
                            </span>
                          )}
                        </div>
                      </div>

                      {story.aiAssessment && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {story.aiAssessment.overallScore}%
                          </div>
                          <div className="text-xs text-gray-500">AI Score</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {stories.length === 0 && (
                    <div className="py-8 text-center">
                      <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                      <p className="text-gray-500">
                        No stories yet. Start writing to see your progress!
                      </p>
                    </div>
                  )}
                </Card>
              </SlideIn>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Writing Streak */}
              <FadeIn delay={0.5}>
                <StreakCounter
                  currentStreak={user.streak?.current || 0}
                  longestStreak={user.streak?.longest || 0}
                  lastWritingDate={user.streak?.lastWritingDate}
                />
              </FadeIn>

              {/* Recent Achievements */}
              <SlideIn direction="right" delay={0.6}>
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Recent Achievements
                  </h3>

                  {unlockedAchievements.slice(0, 3).map(achievement => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      size="sm"
                      showDate={true}
                      className="mb-3"
                    />
                  ))}

                  {unlockedAchievements.length === 0 && (
                    <div className="py-4 text-center">
                      <div className="mb-2 text-3xl">🎯</div>
                      <p className="text-sm text-gray-600">
                        Keep writing to unlock achievements!
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => setActiveTab('achievements')}
                  >
                    View All Achievements
                  </Button>
                </Card>
              </SlideIn>

              {/* Genre Stats */}
              <SlideIn direction="right" delay={0.7}>
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                    <PieChart className="h-5 w-5 text-indigo-600" />
                    Favorite Genres
                  </h3>

                  {Object.keys(statistics.genreStats).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(statistics.genreStats)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([genre, count]) => (
                          <div
                            key={genre}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium capitalize text-gray-700">
                              {genre}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-16 rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-indigo-600"
                                  style={{
                                    width: `${(count / statistics.totalStories) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="w-8 text-right text-sm text-gray-600">
                                {count}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <div className="mb-2 text-3xl">📖</div>
                      <p className="text-sm text-gray-600">
                        Write stories to see your genre preferences!
                      </p>
                    </div>
                  )}
                </Card>
              </SlideIn>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-8">
          {/* Achievements Header */}
          <FadeIn>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                <Trophy className="h-10 w-10 text-yellow-600" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                Your Achievements
              </h2>
              <p className="text-xl text-gray-600">
                {unlockedAchievements.length} of {achievements.length}{' '}
                achievements unlocked
              </p>
              <div className="mx-auto mt-4 w-64">
                <ProgressBar
                  value={unlockedAchievements.length}
                  max={achievements.length}
                  variant="yellow"
                  size="lg"
                />
              </div>
            </div>
          </FadeIn>

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <SlideIn direction="up" delay={0.2}>
              <div>
                <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <Sparkles className="h-6 w-6 text-green-500" />
                  Unlocked Achievements ({unlockedAchievements.length})
                </h3>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {unlockedAchievements.map((achievement, index) => (
                    <FadeIn key={achievement.id} delay={0.1 * index}>
                      <AchievementBadge
                        achievement={achievement}
                        size="lg"
                        showDate={true}
                        showDescription={true}
                        className="h-full"
                      />
                    </FadeIn>
                  ))}
                </div>
              </div>
            </SlideIn>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <SlideIn direction="up" delay={0.3}>
              <div>
                <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <Target className="h-6 w-6 text-gray-400" />
                  Locked Achievements ({lockedAchievements.length})
                </h3>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {lockedAchievements.map((achievement, index) => (
                    <FadeIn key={achievement.id} delay={0.1 * index}>
                      <Card className="border-2 border-dashed border-gray-300 bg-gray-50 p-6 opacity-75">
                        <div className="text-center">
                          <div className="mb-3 text-4xl grayscale">
                            {achievement.icon}
                          </div>
                          <h4 className="mb-2 text-lg font-bold text-gray-700">
                            {achievement.title}
                          </h4>
                          <p className="mb-4 text-sm text-gray-600">
                            {achievement.description}
                          </p>
                          <Badge variant="outline" size="sm">
                            Not Unlocked
                          </Badge>
                        </div>
                      </Card>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </SlideIn>
          )}

          {/* Achievement Categories */}
          <SlideIn direction="up" delay={0.4}>
            <Card className="p-6">
              <h3 className="mb-6 text-xl font-bold text-gray-900">
                Achievement Categories
              </h3>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    category: 'milestone',
                    label: 'Milestones',
                    icon: Flag,
                    color: 'from-blue-500 to-cyan-500',
                    count: achievements.filter(a => a.category === 'milestone')
                      .length,
                    unlocked: unlockedAchievements.filter(
                      a => a.category === 'milestone'
                    ).length,
                  },
                  {
                    category: 'skill',
                    label: 'Skills',
                    icon: Brain,
                    color: 'from-purple-500 to-pink-500',
                    count: achievements.filter(a => a.category === 'skill')
                      .length,
                    unlocked: unlockedAchievements.filter(
                      a => a.category === 'skill'
                    ).length,
                  },
                  {
                    category: 'engagement',
                    label: 'Engagement',
                    icon: Fire,
                    color: 'from-orange-500 to-red-500',
                    count: achievements.filter(a => a.category === 'engagement')
                      .length,
                    unlocked: unlockedAchievements.filter(
                      a => a.category === 'engagement'
                    ).length,
                  },
                  {
                    category: 'exploration',
                    label: 'Exploration',
                    icon: Target,
                    color: 'from-green-500 to-emerald-500',
                    count: achievements.filter(
                      a => a.category === 'exploration'
                    ).length,
                    unlocked: unlockedAchievements.filter(
                      a => a.category === 'exploration'
                    ).length,
                  },
                ].map(cat => (
                  <div key={cat.category} className="text-center">
                    <div
                      className={`mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}
                    >
                      <cat.icon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="mb-1 font-bold text-gray-900">
                      {cat.label}
                    </h4>
                    <p className="mb-2 text-sm text-gray-600">
                      {cat.unlocked} of {cat.count} unlocked
                    </p>
                    <ProgressBar
                      value={cat.unlocked}
                      max={cat.count}
                      variant="default"
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </SlideIn>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Analytics Overview */}
          <FadeIn>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: 'Writing Days',
                  value: statistics.writingDays,
                  icon: Calendar,
                  description: "Unique days you've written",
                },
                {
                  label: 'Avg Words/Story',
                  value: statistics.averageWordsPerStory,
                  icon: Edit,
                  description: 'Average story length',
                },
                {
                  label: 'Published Rate',
                  value: `${Math.round((statistics.publishedStories / Math.max(statistics.totalStories, 1)) * 100)}%`,
                  icon: BookOpen,
                  description: "Stories you've published",
                },
                {
                  label: 'Active Streak',
                  value: user.streak?.current || 0,
                  icon: Fire,
                  description: 'Current writing streak',
                },
              ].map((metric, index) => (
                <FadeIn key={metric.label} delay={0.1 * index}>
                  <Card className="p-6 text-center">
                    <metric.icon className="mx-auto mb-3 h-8 w-8 text-purple-600" />
                    <div className="mb-1 text-3xl font-bold text-gray-900">
                      {metric.value}
                    </div>
                    <div className="mb-1 text-sm font-medium text-gray-700">
                      {metric.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {metric.description}
                    </div>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </FadeIn>

          {/* Story Metrics Chart */}
          <SlideIn direction="up" delay={0.2}>
            <Card className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Story Creation Timeline
              </h3>

              <StoryMetrics
                stories={stories}
                timeRange="30days"
                className="h-64"
              />
            </Card>
          </SlideIn>

          {/* User Metrics */}
          <SlideIn direction="up" delay={0.3}>
            <Card className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Writing Performance
              </h3>

              <UserMetrics
                userId={user._id}
                analytics={analytics}
                timeRange="30days"
                className="h-64"
              />
            </Card>
          </SlideIn>

          {/* Detailed Stats */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Genre Breakdown */}
            <SlideIn direction="left" delay={0.4}>
              <Card className="p-6">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                  <PieChart className="h-5 w-5 text-indigo-600" />
                  Genre Distribution
                </h3>

                {Object.keys(statistics.genreStats).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(statistics.genreStats)
                      .sort(([, a], [, b]) => b - a)
                      .map(([genre, count], index) => (
                        <div key={genre} className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm font-medium capitalize text-gray-700">
                                {genre}
                              </span>
                              <span className="text-sm text-gray-600">
                                {count} stories (
                                {Math.round(
                                  (count / statistics.totalStories) * 100
                                )}
                                %)
                              </span>
                            </div>
                            <ProgressBar
                              value={count}
                              max={statistics.totalStories}
                              variant={
                                [
                                  'blue',
                                  'purple',
                                  'green',
                                  'orange',
                                  'pink',
                                  'cyan',
                                ][index % 6] as any
                              }
                              size="sm"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <PieChart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">
                      Write stories to see genre distribution
                    </p>
                  </div>
                )}
              </Card>
            </SlideIn>

            {/* Monthly Summary */}
            <SlideIn direction="right" delay={0.5}>
              <Card className="p-6">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Calendar className="h-5 w-5 text-green-600" />
                  This Month's Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Stories Written
                        </div>
                        <div className="text-sm text-gray-600">
                          New stories this month
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {statistics.recentStories}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <Star className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Average Score
                        </div>
                        <div className="text-sm text-gray-600">
                          AI assessment average
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {statistics.avgOverallScore}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <Fire className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Writing Streak
                        </div>
                        <div className="text-sm text-gray-600">
                          Current streak
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {user.streak?.current || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                        <Crown className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Level Progress
                        </div>
                        <div className="text-sm text-gray-600">
                          Points to next level
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.max(0, nextLevelPoints - currentPoints)}
                    </div>
                  </div>
                </div>
              </Card>
            </SlideIn>
          </div>
        </div>
      )}
    </div>
  );
}
