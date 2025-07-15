// app/(dashboard)/progress/ProgressClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaChartLine,
  FaAward,
  FaBookOpen,
  FaBullseye,
  FaCalendarAlt,
  FaChartBar,
  FaStar,
  FaFire,
  FaBolt,
  FaTrophy,
  FaClock,
  FaEdit,
  FaUsers,
  FaHeart,
  FaBrain,
  FaMagic,
  FaCrown,
} from 'react-icons/fa';

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
import { calculateUserLevel, getPointsForNextLevel } from '@utils/helpers';
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
  const currentPoints = user.totalPoints || 0;
  const nextLevelPoints = getPointsForNextLevel(currentLevel);
  const levelProgress = (currentPoints % 1000) / 10; // Assuming 1000 points per level

  // Build streakData for StreakCounter
  const streakData = {
    current: typeof user.streak === 'number' ? user.streak : 0,
    longest: typeof user.streak === 'number' ? user.streak : 0,
    lastStoryDate: user.lastStoryCreated || null,
    milestones: [],
    totalRewards: 0,
  };
  const userWithStreak = { ...user, streakData };

  // Achievements mock data matching Achievement type
  const achievements = [
    {
      _id: 'first_story',
      name: 'First Story',
      description: 'Completed your very first story!',
      icon: '🎉',
      type: 'story_milestone' as const,
      rarity: 'common' as const,
      criteria: {},
      points: 10,
      color: '',
      unlockedMessage: '',
      isActive: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      rarityColor: '',
      unlockedAt: statistics.totalStories > 0 ? new Date(Date.now() - 86400000) : undefined,
      category: 'story_milestone',
    },
    {
      _id: 'prolific_writer',
      name: 'Prolific Writer',
      description: 'Written 10 amazing stories',
      icon: '📚',
      type: 'story_milestone' as const,
      rarity: 'common' as const,
      criteria: {},
      points: 10,
      color: '',
      unlockedMessage: '',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      rarityColor: '',
      unlockedAt: statistics.totalStories >= 10 ? new Date(Date.now() - 172800000) : undefined,
      category: 'story_milestone',
    },
    {
      _id: 'grammar_master',
      name: 'Grammar Master',
      description: 'Achieved 90%+ grammar score',
      icon: '✏️',
      type: 'grammar' as const,
      rarity: 'uncommon' as const,
      criteria: {},
      points: 10,
      color: '',
      unlockedMessage: '',
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      rarityColor: '',
      unlockedAt: statistics.avgGrammarScore >= 90 ? new Date(Date.now() - 259200000) : undefined,
      category: 'grammar',
    },
    {
      _id: 'creative_genius',
      name: 'Creative Genius',
      description: 'Achieved 95%+ creativity score',
      icon: '🎨',
      type: 'creativity' as const,
      rarity: 'rare' as const,
      criteria: {},
      points: 10,
      color: '',
      unlockedMessage: '',
      isActive: true,
      sortOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      rarityColor: '',
      unlockedAt: statistics.avgCreativityScore >= 95 ? new Date(Date.now() - 345600000) : undefined,
      category: 'creativity',
    },
    {
      _id: 'streak_master',
      name: 'Streak Master',
      description: 'Maintained a 7-day writing streak',
      icon: '🔥',
      type: 'streak' as const,
      rarity: 'epic' as const,
      criteria: {},
      points: 10,
      color: '',
      unlockedMessage: '',
      isActive: true,
      sortOrder: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      rarityColor: '',
      unlockedAt: (userWithStreak.streakData.current || 0) >= 7 ? new Date(Date.now() - 432000000) : undefined,
      category: 'streak',
    },
    {
      _id: 'explorer',
      name: 'Genre Explorer',
      description: 'Written stories in 5 different genres',
      icon: '🗺️',
      type: 'special' as const,
      rarity: 'rare' as const,
      criteria: {},
      points: 10,
      color: '',
      unlockedMessage: '',
      isActive: true,
      sortOrder: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      rarityColor: '',
      unlockedAt: Object.keys(statistics.genreStats).length >= 5 ? new Date(Date.now() - 518400000) : undefined,
      category: 'special',
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  const overviewStats = [
    {
      label: 'Total Stories',
      value: statistics.totalStories,
      icon: FaBookOpen,
      color: 'from-blue-500 to-cyan-500',
      change: `+${statistics.recentStories} this month`,
    },
    {
      label: 'Words Written',
      value: formatNumber(statistics.totalWords),
      icon: FaEdit,
      color: 'from-green-500 to-emerald-500',
      change: `${statistics.averageWordsPerStory} avg per story`,
    },
    {
      label: 'Writing Level',
      value: currentLevel,
      icon: FaCrown,
      color: 'from-purple-500 to-pink-500',
      change: `${formatNumber(currentPoints)} points`,
    },
    {
      label: 'Achievement Score',
      value: `${statistics.avgOverallScore}%`,
      icon: FaStar,
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
            { key: 'overview', label: 'Overview', icon: FaChartLine },
            { key: 'achievements', label: 'Achievements', icon: FaAward },
            { key: 'analytics', label: 'Analytics', icon: FaChartBar },
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
                  user={user}
                  className="bg-gradient-to-br from-purple-50 to-pink-50"
                />
              </SlideIn>

              {/* Writing Skills */}
              <SlideIn direction="up" delay={0.3}>
                <Card className="p-6">
                  <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                    <FaBrain className="h-5 w-5 text-purple-600" />
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
                        variant="success"
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
                        variant="success"
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
                        variant="success"
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
                    <FaCalendarAlt className="h-5 w-5 text-blue-600" />
                    Recent Writing Activity
                  </h3>

                  {stories.slice(0, 5).map((story, index) => (
                    <div
                      key={story._id}
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
                        <FaBookOpen className="h-5 w-5" />
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

                      {story.assessment && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {story.assessment}%
                          </div>
                          <div className="text-xs text-gray-500">AI Score</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {stories.length === 0 && (
                    <div className="py-8 text-center">
                      <FaBookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300" />
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
                  user={userWithStreak}
                />
              </FadeIn>

              {/* Recent Achievements */}
              <SlideIn direction="right" delay={0.6}>
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                    <FaTrophy className="h-5 w-5 text-yellow-500" />
                    Recent Achievements
                  </h3>

                  {unlockedAchievements.slice(0, 3).map(achievement => (
                    <AchievementBadge
                      key={achievement._id}
                      achievement={achievement}
                      user={user}
                      allAchievements={achievements}
                      size="sm"
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
                    <FaChartBar className="h-5 w-5 text-indigo-600" />
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
                <FaTrophy className="h-10 w-10 text-yellow-600" />
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
                  variant="success"
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
                  <FaMagic className="h-6 w-6 text-green-500" />
                  Unlocked Achievements ({unlockedAchievements.length})
                </h3>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {unlockedAchievements.map((achievement, index) => (
                    <FadeIn key={achievement._id} delay={0.1 * index}>
                      <AchievementBadge
                        achievement={achievement}
                        user={user}
                        allAchievements={achievements}
                        size="lg"
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
                  <FaBullseye className="h-6 w-6 text-gray-400" />
                  Locked Achievements ({lockedAchievements.length})
                </h3>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {lockedAchievements.map((achievement, index) => (
                    <FadeIn key={achievement._id} delay={0.1 * index}>
                      <Card className="border-2 border-dashed border-gray-300 bg-gray-50 p-6 opacity-75">
                        <div className="text-center">
                          <div className="mb-3 text-4xl grayscale">
                            {achievement.icon}
                          </div>
                          <h4 className="mb-2 text-lg font-bold text-gray-700">
                            {achievement.name}
                          </h4>
                          <p className="mb-4 text-sm text-gray-600">
                            {achievement.description}
                          </p>
                          <Badge variant="default" size="sm">
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
                    icon: FaBullseye,
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
                    icon: FaBrain,
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
                    icon: FaFire,
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
                    icon: FaBullseye,
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
                  icon: FaCalendarAlt,
                  description: "Unique days you've written",
                },
                {
                  label: 'Avg Words/Story',
                  value: statistics.averageWordsPerStory,
                  icon: FaEdit,
                  description: 'Average story length',
                },
                {
                  label: 'Published Rate',
                  value: `${Math.round((statistics.publishedStories / Math.max(statistics.totalStories, 1)) * 100)}%`,
                  icon: FaBookOpen,
                  description: "Stories you've published",
                },
                {
                  label: 'Active Streak',
                  value: userWithStreak.streakData.current || 0,
                  icon: FaFire,
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
                <FaChartBar className="h-5 w-5 text-blue-600" />
                Story Creation Timeline
              </h3>

              <StoryMetrics
                timeRange="30d"
                className="h-64"
              />
            </Card>
          </SlideIn>

          {/* User Metrics */}
          <SlideIn direction="up" delay={0.3}>
            <Card className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                <FaChartLine className="h-5 w-5 text-green-600" />
                Writing Performance
              </h3>

              <UserMetrics
                timeRange="30d"
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
                  <FaChartBar className="h-5 w-5 text-indigo-600" />
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
                                  'default',
                                  'success',
                                  'warning',
                                  'error',
                                  'default',
                                  'success',
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
                    <FaChartBar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
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
                  <FaCalendarAlt className="h-5 w-5 text-green-600" />
                  This Month's Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <FaBookOpen className="h-5 w-5 text-blue-600" />
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
                        <FaStar className="h-5 w-5 text-purple-600" />
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
                        <FaFire className="h-5 w-5 text-green-600" />
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
                      {userWithStreak.streakData.current || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                        <FaCrown className="h-5 w-5 text-orange-600" />
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
