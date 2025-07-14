// app/components/gamification/StreakCounter.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Calendar,
  Target,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { ProgressBar } from '@components/ui/progress-bar';
import {
  calculateCurrentStreak,
  getStreakMotivation,
  isStreakActive,
} from '@utils/helpers';
import { formatDate, formatTimeAgo } from '@utils/formatters';
import { STREAK_MILESTONES } from '@utils/constants';
import type { StreakData } from '../../../types/user';

// Extend User type locally to include streakData for type safety
interface UserWithStreak extends Record<string, any> {
  streakData?: StreakData;
}

interface StreakCounterProps {
  user: UserWithStreak;
  onWriteStory?: () => void;
  showMotivation?: boolean;
  animated?: boolean;
  compact?: boolean;
  className?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  user,
  onWriteStory,
  showMotivation = true,
  animated = true,
  compact = false,
  className,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const streakData: StreakData = user.streakData || {
    current: 0,
    longest: 0,
    lastStoryDate: null,
    milestones: [],
    totalRewards: 0,
  };
  const currentStreak = calculateCurrentStreak(streakData);
  const isActive = isStreakActive(streakData);
  const motivation = getStreakMotivation(currentStreak, isActive);

  const nextMilestone = STREAK_MILESTONES.find(
    milestone => milestone.days > currentStreak
  );
  const progressToNext = nextMilestone
    ? (currentStreak / nextMilestone.days) * 100
    : 100;

  const getStreakColor = (streak: number, active: boolean) => {
    if (!active) return 'text-gray-400';
    if (streak >= 30) return 'text-orange-500';
    if (streak >= 14) return 'text-red-500';
    if (streak >= 7) return 'text-yellow-500';
    if (streak >= 3) return 'text-orange-400';
    return 'text-gray-500';
  };

  const getStreakBadgeVariant = (streak: number) => {
    if (streak >= 30) return 'warning';
    if (streak >= 14) return 'error';
    if (streak >= 7) return 'warning';
    if (streak >= 3) return 'info';
    return 'default';
  };

  const getTimeUntilStreakReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilReset = tomorrow.getTime() - now.getTime();
    const hoursUntilReset = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor(
      (msUntilReset % (1000 * 60 * 60)) / (1000 * 60)
    );

    return { hours: hoursUntilReset, minutes: minutesUntilReset };
  };

  const timeUntilReset = getTimeUntilStreakReset();
  const streakColor = getStreakColor(currentStreak, isActive);

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <motion.div
          animate={
            animated && isActive
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="flex items-center space-x-2"
        >
          <Flame
            className={`${streakColor} ${currentStreak >= 7 ? 'animate-pulse' : ''}`}
            size={20}
          />
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {currentStreak}
          </span>
        </motion.div>

        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {currentStreak === 0
              ? 'Start your streak!'
              : `${currentStreak} day streak`}
          </div>
          {!isActive && currentStreak > 0 && (
            <div className="text-xs text-orange-600 dark:text-orange-400">
              Streak at risk! Write today to keep it going.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Streak Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={
                animated && isActive && currentStreak > 0
                  ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 4,
              }}
              className={`rounded-full bg-gradient-to-br p-3 ${
                isActive
                  ? 'from-orange-400 to-red-500'
                  : 'from-gray-300 to-gray-400'
              }`}
            >
              <Flame
                className={`text-white ${currentStreak >= 7 ? 'animate-pulse' : ''}`}
                size={24}
              />
            </motion.div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentStreak === 0
                  ? 'Start Your Streak'
                  : `${currentStreak} Day Streak`}
              </h3>
              <Badge variant={getStreakBadgeVariant(currentStreak)}>
                {isActive ? 'Active' : 'Needs Attention'}
              </Badge>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {streakData.longest || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Best Streak
            </div>
          </div>
        </div>

        {/* Streak Status */}
        {!isActive && currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20"
          >
            <div className="flex items-center space-x-3">
              <Clock className="text-orange-600" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Your streak is at risk!
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Write a story in the next {timeUntilReset.hours}h{' '}
                  {timeUntilReset.minutes}m to keep your {currentStreak}-day
                  streak alive.
                </p>
              </div>
              {onWriteStory && (
                <Button variant="primary" size="sm" onClick={onWriteStory}>
                  Write Now
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Progress to Next Milestone */}
        {nextMilestone && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress to {nextMilestone.name}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {nextMilestone.days - currentStreak} days to go
              </span>
            </div>

            <ProgressBar
              value={currentStreak}
              max={nextMilestone.days}
              variant={isActive ? 'warning' : 'default'}
              size="md"
              showPercentage
            />

            <div className="flex items-center justify-center">
              <Badge variant="warning" size="sm">
                <Award size={12} className="mr-1" />+{nextMilestone.points}{' '}
                points reward
              </Badge>
            </div>
          </div>
        )}

        {/* Streak Calendar Preview */}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-3 flex items-center space-x-2">
            <Calendar className="text-gray-600" size={16} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Recent Activity
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, index) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - index));
              const hasStory = index >= 7 - currentStreak && isActive;

              return (
                <div
                  key={index}
                  className={`flex h-8 w-8 items-center justify-center rounded text-xs ${
                    hasStory
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                  }`}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>7 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Motivation Section */}
        {showMotivation && motivation && (
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="mb-2 flex items-center space-x-2">
              <TrendingUp className="text-blue-600" size={16} />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Keep Going!
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {motivation}
            </p>
          </div>
        )}

        {/* Streak Milestones */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Streak Milestones
          </h4>

          <div className="max-h-32 space-y-2 overflow-y-auto">
            {STREAK_MILESTONES.slice(0, 5).map((milestone, index) => {
              const isReached = currentStreak >= milestone.days;
              const isCurrent = nextMilestone?.days === milestone.days;

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-lg p-2 ${
                    isReached
                      ? 'border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : isCurrent
                        ? 'border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                        : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        isReached
                          ? 'bg-green-500 text-white'
                          : isCurrent
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-300 text-gray-500 dark:bg-gray-600'
                      }`}
                    >
                      {isReached ? '✓' : milestone.days}
                    </div>

                    <div>
                      <span
                        className={`text-sm font-medium ${
                          isReached
                            ? 'text-green-800 dark:text-green-200'
                            : isCurrent
                              ? 'text-orange-800 dark:text-orange-200'
                              : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {milestone.name}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {milestone.days} days
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={
                      isReached ? 'success' : isCurrent ? 'warning' : 'default'
                    }
                    size="sm"
                  >
                    +{milestone.points}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        {onWriteStory && (
          <Button
            variant="primary"
            size="lg"
            onClick={onWriteStory}
            className="w-full"
            disabled={
              !!(
                isActive &&
                streakData.lastStoryDate &&
                new Date(streakData.lastStoryDate).toDateString() ===
                  new Date().toDateString()
              )
            }
          >
            {isActive &&
            streakData.lastStoryDate &&
            new Date(streakData.lastStoryDate).toDateString() ===
              new Date().toDateString()
              ? '✅ Story Written Today!'
              : '🔥 Write Story Today'}
          </Button>
        )}
      </div>
    </Card>
  );
};
