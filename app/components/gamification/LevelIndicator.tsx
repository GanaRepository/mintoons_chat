// app/components/gamification/LevelIndicator.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Target, Award } from 'lucide-react';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { ProgressBar } from '@components/ui/progress-bar';
import {
  calculateUserLevel,
  getPointsForNextLevel,
  getLevelBenefits,
} from '@utils/helpers';
import { formatNumber } from '@utils/formatters';
import { LEVEL_THRESHOLDS, LEVEL_REWARDS } from '@utils/constants';
import type { User } from '../../../types/user';


interface LevelIndicatorProps {
  user: User;
  showDetails?: boolean;
  compact?: boolean;
  animated?: boolean;
  className?: string;
}

export const LevelIndicator: React.FC<LevelIndicatorProps> = ({
  user,
  showDetails = true,
  compact = false,
  animated = true,
  className,
}) => {
  const currentLevel = calculateUserLevel(user.totalPoints || 0);
  const currentPoints = user.totalPoints || 0;
  const pointsForCurrentLevel = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const pointsForNextLevel = getPointsForNextLevel(currentLevel);
  const pointsNeededForNext = pointsForNextLevel - currentPoints;
  const progressInCurrentLevel = currentPoints - pointsForCurrentLevel;
  const pointsNeededInLevel = pointsForNextLevel - pointsForCurrentLevel;
  const levelProgress = (progressInCurrentLevel / pointsNeededInLevel) * 100;

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'from-purple-500 to-pink-500';
    if (level >= 30) return 'from-blue-500 to-purple-500';
    if (level >= 20) return 'from-green-500 to-blue-500';
    if (level >= 10) return 'from-yellow-500 to-green-500';
    return 'from-gray-400 to-gray-500';
  };

  const getLevelTitle = (level: number) => {
    if (level >= 50) return 'Master Storyteller';
    if (level >= 30) return 'Expert Writer';
    if (level >= 20) return 'Skilled Author';
    if (level >= 10) return 'Creative Writer';
    if (level >= 5) return 'Story Enthusiast';
    return 'Budding Writer';
  };

  const getLevelBadgeVariant = (level: number) => {
    if (level >= 30) return 'purple';
    if (level >= 20) return 'success';
    if (level >= 10) return 'warning';
    return 'default';
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div
          className={`h-10 w-10 rounded-full bg-gradient-to-br ${getLevelColor(currentLevel)} flex items-center justify-center font-bold text-white`}
        >
          {currentLevel}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Level {currentLevel}
            </span>
            <Badge variant={getLevelBadgeVariant(currentLevel)} size="sm">
              {getLevelTitle(currentLevel)}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Star size={12} />
            <span>{formatNumber(currentPoints)} points</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Level Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              initial={animated ? { scale: 0 } : {}}
              animate={animated ? { scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`h-16 w-16 rounded-full bg-gradient-to-br ${getLevelColor(currentLevel)} flex items-center justify-center text-xl font-bold text-white shadow-lg`}
            >
              {currentLevel}
            </motion.div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Level {currentLevel}
              </h3>
              <Badge variant={getLevelBadgeVariant(currentLevel)}>
                {getLevelTitle(currentLevel)}
              </Badge>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <Star size={16} />
              <span className="text-lg font-semibold">
                {formatNumber(currentPoints)}
              </span>
            </div>
            <div className="text-xs text-gray-500">Total Points</div>
          </div>
        </div>

        {/* Progress to Next Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress to Level {currentLevel + 1}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatNumber(pointsNeededForNext - currentPoints)} points needed
            </span>
          </div>

          <ProgressBar
            value={progressInCurrentLevel}
            max={pointsNeededInLevel}
            variant="default"
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          />

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatNumber(pointsForCurrentLevel)} pts</span>
            <span>{Math.round(levelProgress)}% complete</span>
            <span>{formatNumber(pointsForNextLevel)} pts</span>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Level Stats */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.storyCount || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Stories
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.streak || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Day Streak
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.achievements?.length || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Achievements
                </div>
              </div>
            </div>

            {/* Current Level Benefits */}
            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <div className="mb-2 flex items-center space-x-2">
                <Award className="text-purple-600" size={16} />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Level {currentLevel} Benefits
                </span>
              </div>

              <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                {getLevelBenefits(currentLevel).map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-600" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Level Preview */}
            {currentLevel < 100 && (
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Next: Level {currentLevel + 1}
                    </span>
                  </div>
                  <Badge variant="info" size="sm">
                    {formatNumber(pointsNeededForNext)} points
                  </Badge>
                </div>

                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Unlock new features and earn the "
                  {getLevelTitle(currentLevel + 1)}" title!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
