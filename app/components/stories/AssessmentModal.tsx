// app/components/stories/AssessmentModal.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  BookOpen,
  Lightbulb,
  CheckCircle,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { Modal } from '@components/ui/modal';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { ProgressBar } from '@components/ui/progress-bar';
import { Card } from '@components/ui/card';
import { formatNumber } from '@utils/formatters';
import type { StoryAssessment } from '../../../types/assessment';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: StoryAssessment | null;
  storyTitle: string;
  onRetry?: () => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  assessment,
  storyTitle,
  onRetry,
}) => {
  if (!assessment) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    if (score >= 50) return 'default';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };

  const scoreCategories = [
    {
      label: 'Grammar & Spelling',
      score: assessment.grammarScore,
      icon: CheckCircle,
      description: 'Correct use of language and spelling',
    },
    {
      label: 'Creativity',
      score: assessment.creativityScore,
      icon: Lightbulb,
      description: 'Original ideas and imagination',
    },
    {
      label: 'Story Structure',
      score: assessment.plotCoherence || 75,
      icon: BookOpen,
      description: 'Clear beginning, middle, and end',
    },
    {
      label: 'Character Development',
      score: assessment.characterDevelopment || 70,
      icon: Target,
      description: 'Well-developed and interesting characters',
    },
  ];

  const overallGrade =
    assessment.overallScore >= 90
      ? 'A'
      : assessment.overallScore >= 80
        ? 'B'
        : assessment.overallScore >= 70
          ? 'C'
          : assessment.overallScore >= 60
            ? 'D'
            : 'F';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Story Assessment"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-2xl font-bold text-white"
          >
            {overallGrade}
          </motion.div>

          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            "{storyTitle}"
          </h3>

          <div className="flex items-center justify-center space-x-2">
            <Star className="fill-current text-yellow-500" size={20} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {assessment.overallScore}
            </span>
            <span className="text-gray-500 dark:text-gray-400">/100</span>
            <Badge variant={getScoreColor(assessment.overallScore)} size="sm">
              {getScoreLabel(assessment.overallScore)}
            </Badge>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                Overall Score
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {assessment.overallScore}/100
              </span>
            </div>
            <ProgressBar
              value={assessment.overallScore}
              max={100}
              variant={getScoreColor(assessment.overallScore)}
              size="lg"
              showPercentage
            />
          </div>
        </Card>

        {/* Detailed Scores */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Detailed Breakdown
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {scoreCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                        <Icon className="text-purple-600" size={16} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.label}
                          </h5>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {category.score}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {category.description}
                        </p>
                        <ProgressBar
                          value={category.score}
                          max={100}
                          variant={getScoreColor(category.score)}
                          size="sm"
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            AI Feedback
          </h4>

          {assessment.feedback && (
            <Card className="p-4">
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                {assessment.feedback}
              </p>
            </Card>
          )}

          {/* Strengths */}
          {assessment.strengths && assessment.strengths.length > 0 && (
            <div>
              <h5 className="mb-2 flex items-center font-medium text-green-700 dark:text-green-400">
                <CheckCircle size={16} className="mr-2" />
                Strengths
              </h5>
              <div className="space-y-2">
                {assessment.strengths.map((strength, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {strength}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {assessment.suggestions && assessment.suggestions.length > 0 && (
            <div>
              <h5 className="mb-2 flex items-center font-medium text-blue-700 dark:text-blue-400">
                <TrendingUp size={16} className="mr-2" />
                Suggestions for Improvement
              </h5>
              <div className="space-y-2">
                {assessment.suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {suggestion}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          <div className="flex space-x-2">
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                Get New Assessment
              </Button>
            )}
            <Button variant="primary" onClick={onClose}>
              Continue Writing
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
