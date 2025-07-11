// app/components/stories/StoryProgress.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Clock, Award } from 'lucide-react';
import { Card } from '@components/ui/card';
import { ProgressBar } from '@components/ui/progress-bar';
import { Badge } from '@components/ui/badge';
import { getAgeAppropriateTarget } from '@utils/age-restrictions';
import { formatNumber } from '@utils/formatters';

interface StoryProgressProps {
  currentWords: number;
  targetWords?: number;
  userAge: number;
  timeSpent?: number; // in minutes
  sessionsCount?: number;
  className?: string;
}

export const StoryProgress: React.FC<StoryProgressProps> = ({
  currentWords,
  targetWords,
  userAge,
  timeSpent = 0,
  sessionsCount = 1,
  className,
}) => {
  const finalTargetWords = targetWords || getAgeAppropriateTarget(userAge);
  const progressPercentage = Math.min(
    (currentWords / finalTargetWords) * 100,
    100
  );
  const readingTime = Math.ceil(currentWords / 225);
  const isCompleted = currentWords >= finalTargetWords;

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'success';
    if (progressPercentage >= 75) return 'warning';
    return 'default';
  };

  const getEncouragementMessage = () => {
    if (isCompleted) {
      return "🎉 Amazing! You've reached your target!";
    }
    if (progressPercentage >= 75) {
      return '🚀 Almost there! Keep going!';
    }
    if (progressPercentage >= 50) {
      return "📚 Great progress! You're halfway there!";
    }
    if (progressPercentage >= 25) {
      return '✨ Nice start! Keep writing!';
    }
    return '📝 Every word counts! Start your adventure!';
  };

  const milestones = [
    {
      words: Math.floor(finalTargetWords * 0.25),
      label: 'Getting Started',
      icon: '🌱',
    },
    {
      words: Math.floor(finalTargetWords * 0.5),
      label: 'Halfway Hero',
      icon: '⭐',
    },
    {
      words: Math.floor(finalTargetWords * 0.75),
      label: 'Almost There',
      icon: '🚀',
    },
    { words: finalTargetWords, label: 'Story Complete', icon: '🎉' },
  ];

  const currentMilestone = milestones.findIndex(m => currentWords < m.words);
  const nextMilestone =
    currentMilestone !== -1 ? milestones[currentMilestone] : null;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="text-purple-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Story Progress
            </h3>
          </div>
          {isCompleted && (
            <Badge variant="success" size="sm">
              <Award size={12} className="mr-1" />
              Complete!
            </Badge>
          )}
        </div>

        {/* Main Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Words written
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatNumber(currentWords)} / {formatNumber(finalTargetWords)}
            </span>
          </div>

          <ProgressBar
            value={currentWords}
            max={finalTargetWords}
            variant={getProgressColor()}
            size="lg"
            showPercentage
          />

          <motion.p
            key={getEncouragementMessage()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm font-medium text-purple-600 dark:text-purple-400"
          >
            {getEncouragementMessage()}
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(currentWords)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Words
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white">
              <Clock size={16} className="mr-1" />
              {readingTime}m
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Reading Time
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {sessionsCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Sessions
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:from-purple-900/20 dark:to-pink-900/20"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{nextMilestone.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Next: {nextMilestone.label}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatNumber(nextMilestone.words - currentWords)} words to go
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(
                    ((nextMilestone.words - currentWords) / finalTargetWords) *
                      100
                  )}
                  %
                </div>
                <div className="text-xs text-gray-500">remaining</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Milestones Timeline */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Milestones
          </p>
          <div className="flex items-center justify-between">
            {milestones.map((milestone, index) => {
              const isReached = currentWords >= milestone.words;
              const isCurrent = nextMilestone?.words === milestone.words;

              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center space-y-1"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
                      isReached
                        ? 'bg-purple-600 text-white'
                        : isCurrent
                          ? 'border-2 border-purple-600 bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                          : 'bg-gray-200 text-gray-400 dark:bg-gray-700'
                    }`}
                  >
                    {milestone.icon}
                  </div>
                  <div className="max-w-16 text-center text-xs">
                    <div
                      className={`font-medium ${
                        isReached
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {formatNumber(milestone.words)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
