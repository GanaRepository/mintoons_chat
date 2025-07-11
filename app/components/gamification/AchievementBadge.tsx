// app/components/gamification/AchievementBadge.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Star,
  Trophy,
  Target,
  Zap,
  Crown,
  Heart,
  BookOpen,
} from 'lucide-react';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Modal } from '@components/ui/modal';
import {
  ACHIEVEMENTS,
  getAchievementProgress,
  isAchievementUnlocked,
} from '@utils/constants';
import { formatNumber, formatDate } from '@utils/formatters';
import { calculateAchievementProgress } from '@utils/helpers';
import type {
  Achievement,
  AchievementType,
  AchievementProgress,
} from '../../../types/achievement';
import type { User } from '../../../types/user';

// Extended Achievement interface for UI purposes
interface ExtendedAchievement extends Achievement {
  unlockedAt?: Date;
  prerequisites?: string[];
}

interface AchievementBadgeProps {
  achievement: ExtendedAchievement;
  user: User;
  isUnlocked?: boolean;
  progress?: AchievementProgress;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  user,
  isUnlocked: propIsUnlocked,
  progress: propProgress,
  size = 'md',
  showProgress = true,
  onClick,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const isUnlocked =
    propIsUnlocked ?? isAchievementUnlocked(achievement.id, user);
  const progress =
    propProgress ?? calculateAchievementProgress(achievement, user);

  const getAchievementIcon = (type: AchievementType) => {
    const iconMap: Record<AchievementType, React.ComponentType<any>> = {
      story_milestone: BookOpen,
      quality_score: Star,
      streak: Zap,
      creativity: Star,
      grammar: Award,
      special: Crown,
    };
    return iconMap[type] || Award;
  };

  const getAchievementColor = (type: AchievementType, unlocked: boolean) => {
    if (!unlocked) return 'text-gray-400';

    const colorMap: Record<AchievementType, string> = {
      story_milestone: 'text-blue-500',
      quality_score: 'text-purple-500',
      streak: 'text-orange-500',
      creativity: 'text-purple-500',
      grammar: 'text-green-500',
      special: 'text-indigo-500',
    };
    return colorMap[type] || 'text-gray-500';
  };

  const getBadgeVariant = (type: AchievementType) => {
    const variantMap: Record<
      AchievementType,
      'info' | 'purple' | 'warning' | 'success' | 'default'
    > = {
      story_milestone: 'info',
      quality_score: 'purple',
      streak: 'warning',
      creativity: 'purple',
      grammar: 'success',
      special: 'purple',
    };
    return variantMap[type] || 'default';
  };

  const Icon = getAchievementIcon(achievement.type);
  const iconColor = getAchievementColor(achievement.type, isUnlocked);
  const progressPercentage =
    progress.target > 0 ? (progress.current / progress.target) * 100 : 0;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32,
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowDetails(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={`relative cursor-pointer ${className || ''}`}
      >
        <div
          className={`${sizeClasses[size]} flex items-center justify-center rounded-full border-2 transition-all ${
            isUnlocked
              ? `border-${achievement.type === 'special' ? 'purple' : 'yellow'}-400 bg-gradient-to-br from-yellow-100 to-orange-100 shadow-lg dark:from-yellow-900/20 dark:to-orange-900/20`
              : 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
          }`}
        >
          <Icon
            size={iconSizes[size]}
            className={isUnlocked ? iconColor : 'text-gray-400'}
          />

          {/* Lock overlay for unachieved */}
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-500/50 backdrop-blur-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600">
                <div className="h-3 w-3 rounded-sm border border-white" />
              </div>
            </div>
          )}
        </div>

        {/* Progress Ring */}
        {!isUnlocked && showProgress && progress.target > 0 && (
          <svg
            className={`absolute inset-0 ${sizeClasses[size]} -rotate-90 transform`}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-300 dark:text-gray-600"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{
                strokeDashoffset:
                  2 * Math.PI * 45 * (1 - progressPercentage / 100),
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={iconColor}
            />
          </svg>
        )}

        {/* Points Badge */}
        {isUnlocked && achievement.points > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute -right-2 -top-2"
          >
            <Badge variant={getBadgeVariant(achievement.type)} size="sm">
              +{achievement.points}
            </Badge>
          </motion.div>
        )}

        {/* Unlock Animation */}
        {isUnlocked && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.2, 1], rotate: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0"
          >
            <div className="h-full w-full animate-pulse rounded-full border-2 border-yellow-400" />
          </motion.div>
        )}
      </motion.div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Achievement Details"
        size="md"
      >
        <div className="space-y-6">
          {/* Achievement Header */}
          <div className="text-center">
            <div
              className={`mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border-2 ${
                isUnlocked
                  ? 'border-yellow-400 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20'
                  : 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
              }`}
            >
              <Icon size={32} className={iconColor} />
            </div>

            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              {achievement.name}
            </h3>

            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {achievement.description}
            </p>

            <div className="flex items-center justify-center space-x-4">
              <Badge variant={getBadgeVariant(achievement.type)}>
                {achievement.type.replace('_', ' ')}
              </Badge>

              {achievement.points > 0 && (
                <Badge variant="warning">
                  <Star size={12} className="mr-1" />
                  {achievement.points} points
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Section */}
          {!isUnlocked && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatNumber(progress.current)} /{' '}
                    {formatNumber(progress.target)}
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>

                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  {progress.target - progress.current} more to unlock!
                </p>
              </div>
            </Card>
          )}

          {/* Unlock Information */}
          {isUnlocked && achievement.unlockedAt && (
            <Card className="border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center space-x-2">
                <Trophy className="text-green-600" size={16} />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Unlocked on {formatDate(achievement.unlockedAt)}
                </span>
              </div>
            </Card>
          )}

          {/* Related Achievements */}
          {achievement.prerequisites &&
            achievement.prerequisites.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Prerequisites
                </h4>
                <div className="space-y-2">
                  {achievement.prerequisites.map((prereqId: string) => {
                    const prereq =
                      ACHIEVEMENTS[prereqId as keyof typeof ACHIEVEMENTS];
                    const prereqUnlocked = isAchievementUnlocked(
                      prereqId,
                      user
                    );

                    return prereq ? (
                      <div
                        key={prereqId}
                        className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-800"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                            prereqUnlocked
                              ? 'border-green-500 bg-green-100 dark:bg-green-900/20'
                              : 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700'
                          }`}
                        >
                          <Icon
                            size={16}
                            className={
                              prereqUnlocked
                                ? 'text-green-600'
                                : 'text-gray-400'
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <span
                            className={`text-sm font-medium ${
                              prereqUnlocked
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {prereq.name}
                          </span>
                        </div>
                        {prereqUnlocked && (
                          <Badge variant="success" size="sm">
                            Complete
                          </Badge>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

          {/* Action Button */}
          <div className="text-center">
            <Button variant="primary" onClick={() => setShowDetails(false)}>
              {isUnlocked ? 'Awesome!' : 'Keep Going!'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
