// app/components/stories/SampleStoryCard.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, BookOpen, Clock, Star, Copy } from 'lucide-react';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Modal } from '@components/ui/modal';
import { calculateReadingTime } from '@utils/helpers';
import { formatNumber } from '@utils/formatters';
import type { SampleStory } from '@types/story';

interface SampleStoryCardProps {
  story: SampleStory;
  onUseAsTemplate?: (story: SampleStory) => void;
  onPreview?: (story: SampleStory) => void;
  userAge?: number;
  className?: string;
}

export const SampleStoryCard: React.FC<SampleStoryCardProps> = ({
  story,
  onUseAsTemplate,
  onPreview,
  userAge = 8,
  className
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const readingTime = calculateReadingTime(story.content.length, userAge);
  const wordCount = story.content.split(' ').length;

  const handleUseTemplate = () => {
    onUseAsTemplate?.(story);
  };

  const handlePreview = () => {
    setShowPreview(true);
    onPreview?.(story);
  };

  const isAgeAppropriate = userAge >= story.minAge && userAge <= story.maxAge;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={className}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 relative">
          {/* Story Cover */}
          <div className="relative h-48 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
            <div className="absolute inset-0 bg-black/10" />
            
            {/* Age Badge */}
            <div className="absolute top-3 left-3">
              <Badge 
                variant={isAgeAppropriate ? 'success' : 'default'} 
                size="sm"
              >
                Ages {story.minAge}-{story.maxAge}
              </Badge>
            </div>

            {/* Difficulty Level */}
            <div className="absolute top-3 right-3">
              <Badge variant="warning" size="sm">
                {story.difficulty}
              </Badge>
            </div>

            {/* Play Button Overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8 
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={handlePreview}
                className="rounded-full w-16 h-16 shadow-lg"
              >
                <Play size={24} />
              </Button>
            </motion.div>

            {/* Genre Icon */}
            <div className="absolute bottom-3 left-3">
              <div className="text-4xl filter drop-shadow-lg">
                {story.genre === 'Adventure' && '🗺️'}
                {story.genre === 'Fantasy' && '🧙‍♂️'}
                {story.genre === 'Mystery' && '🔍'}
                {story.genre === 'Friendship' && '🤝'}
                {story.genre === 'Animal' && '🐾'}
                {story.genre === 'Space' && '🚀'}
                {!['Adventure', 'Fantasy', 'Mystery', 'Friendship', 'Animal', 'Space'].includes(story.genre) && '📚'}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Title and Description */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {story.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                {story.description}
              </p>
            </div>

            {/* Story Elements Preview */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Story Elements:
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(story.elements).slice(0, 4).map(([key, value]) => (
                  <Badge key={key} variant="default" size="sm">
                    {value}
                  </Badge>
                ))}
                {Object.keys(story.elements).length > 4 && (
                  <Badge variant="default" size="sm">
                    +{Object.keys(story.elements).length - 4}
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <BookOpen size={14} />
                  <span>{formatNumber(wordCount)} words</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>{readingTime}m read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star size={14} className="text-yellow-500" />
                  <span>{story.rating}/5</span>
                </div>
              </div>
            </div>

            {/* Learning Goals */}
            {story.learningGoals && story.learningGoals.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  📚 You'll Learn:
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {story.learningGoals.slice(0, 2).join(', ')}
                  {story.learningGoals.length > 2 && ` +${story.learningGoals.length - 2} more`}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleUseTemplate}
                disabled={!isAgeAppropriate}
                className="flex-1"
              >
                <Copy size={14} className="mr-2" />
                Use as Template
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
              >
                <Play size={14} className="mr-2" />
                Preview
              </Button>
            </div>

            {!isAgeAppropriate && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 text-center">
                This story is recommended for ages {story.minAge}-{story.maxAge}
              </p>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={story.title}
        size="lg"
      >
        <div className="space-y-4">
          {/* Story Info */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <Badge variant="purple" size="sm">
                {story.genre}
              </Badge>
              <Badge variant="default" size="sm">
                Ages {story.minAge}-{story.maxAge}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {readingTime} min read
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Star size={16} className="text-yellow-500" />
              <span className="text-sm font-medium">{story.rating}/5</span>
            </div>
          </div>

          {/* Story Content Preview */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300 max-h-96 overflow-y-auto">
              {story.content.substring(0, 1000)}
              {story.content.length > 1000 && (
                <span className="text-gray-500 italic">... (preview truncated)</span>
              )}
            </div>
          </div>

          {/* Elements Used */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Story Elements Used:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(story.elements).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                handleUseTemplate();
                setShowPreview(false);
              }}
              disabled={!isAgeAppropriate}
            >
              <Copy size={14} className="mr-2" />
              Use This Template
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};