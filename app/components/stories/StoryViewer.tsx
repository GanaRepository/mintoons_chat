// app/components/stories/StoryViewer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Heart,
  Share2,
  Download,
  Eye,
  Clock,
  User,
  Star,
  MessageSquare,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Dropdown } from '@components/ui/dropdown';
import { CommentSystem } from './CommentSystem';
import { formatDate, formatTimeAgo, formatNumber } from '@utils/formatters';
import { calculateReadingTime } from '@utils/helpers';
import { shareStory } from '@utils/helpers';
import type { Story } from '@types/story';

interface StoryViewerProps {
  story: Story;
  onLike?: (storyId: string) => void;
  onShare?: (storyId: string) => void;
  isReadOnly?: boolean;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  story,
  onLike,
  onShare,
  isReadOnly = false,
}) => {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(story.likes?.length || 0);
  const [viewsCount, setViewsCount] = useState(story.views || 0);

  useEffect(() => {
    setIsLiked(story.likes?.includes(session?.user.id || '') || false);

    // Track view
    if (session?.user.id !== story.authorId) {
      trackView();
    }
  }, [story, session]);

  const trackView = async () => {
    try {
      await fetch(`/api/stories/${story._id}/view`, { method: 'POST' });
      setViewsCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const handleLike = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/stories/${story._id}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => (newIsLiked ? prev + 1 : prev - 1));
        onLike?.(story._id);
      }
    } catch (error) {
      console.error('Failed to like story:', error);
    }
  };

  const handleShare = async () => {
    try {
      await shareStory(story);
      onShare?.(story._id);
    } catch (error) {
      console.error('Failed to share story:', error);
    }
  };

  const handleExport = async (format: 'pdf' | 'word') => {
    try {
      const response = await fetch(`/api/export/${format}/${story._id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${story.title}.${format === 'pdf' ? 'pdf' : 'docx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
    }
  };

  const exportOptions = [
    {
      label: 'Download PDF',
      value: 'pdf',
      onClick: () => handleExport('pdf'),
    },
    {
      label: 'Download Word',
      value: 'word',
      onClick: () => handleExport('word'),
    },
  ];

  const readingTime = calculateReadingTime(
    story.content.length,
    session?.user.age || 12
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {story.title}
                </h1>

                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <User size={16} />
                    <span>by {story.authorName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{readingTime} min read</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen size={16} />
                    <span>
                      {formatNumber(story.content.split(' ').length)} words
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={story.status === 'published' ? 'success' : 'default'}
                  size="sm"
                >
                  {story.status}
                </Badge>

                {story.assessment && (
                  <Badge variant="warning" size="sm">
                    <Star size={12} className="mr-1" />
                    {story.assessment.overallScore}
                  </Badge>
                )}
              </div>
            </div>

            {/* Story Elements */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(story.elements).map(([key, value]) => (
                <Badge key={key} variant="purple" size="sm">
                  {value}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  disabled={!session || isReadOnly}
                  className={`flex items-center space-x-2 text-sm transition-colors ${
                    isLiked
                      ? 'text-red-500'
                      : 'text-gray-600 hover:text-red-500 dark:text-gray-400'
                  }`}
                >
                  <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                  <span>{formatNumber(likesCount)}</span>
                </button>

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Eye size={16} />
                  <span>{formatNumber(viewsCount)}</span>
                </div>

                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 text-sm text-gray-600 transition-colors hover:text-purple-500 dark:text-gray-400"
                >
                  <MessageSquare size={16} />
                  <span>{formatNumber(story.comments?.length || 0)}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 size={14} className="mr-2" />
                  Share
                </Button>

                <Dropdown
                  trigger={
                    <Button variant="outline" size="sm">
                      <Download size={14} className="mr-2" />
                      Export
                    </Button>
                  }
                  items={exportOptions}
                  align="right"
                />
              </div>
            </div>
          </motion.div>

          {/* Story Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                  {story.content}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Info */}
          <Card className="p-4">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-xl font-bold text-white">
                {story.authorName?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {story.authorName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Age {story.authorAge || 'Unknown'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {story.authorStoryCount || 1}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Stories
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {story.authorPoints || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Points
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Story Stats */}
          <Card className="p-4">
            <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
              Story Details
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Created
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(story.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Last Updated
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatTimeAgo(story.updatedAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Genre</span>
                <span className="text-gray-900 dark:text-white">
                  {story.elements.genre || 'Mixed'}
                </span>
              </div>
              {story.assessment && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    AI Score
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star size={12} className="text-yellow-500" />
                    <span className="text-gray-900 dark:text-white">
                      {story.assessment.overallScore}/100
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Related Stories */}
          {story.relatedStories && story.relatedStories.length > 0 && (
            <Card className="p-4">
              <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
                More Stories
              </h4>
              <div className="space-y-3">
                {story.relatedStories.slice(0, 3).map(relatedStory => (
                  <div
                    key={relatedStory._id}
                    className="flex items-start space-x-3"
                  >
                    <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-400 to-purple-400" />
                    <div className="min-w-0 flex-1">
                      <h5 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {relatedStory.title}
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        by {relatedStory.authorName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Comments Sidebar */}
      {showComments && (
        <CommentSystem
          storyId={story._id}
          onClose={() => setShowComments(false)}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
};
