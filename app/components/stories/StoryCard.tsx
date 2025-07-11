'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, MessageCircle, Star, MoreVertical } from 'lucide-react';
import Link from 'next/link';

import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Dropdown } from '@components/ui/dropdown';
import { Button } from '@components/ui/button';

import { formatDate, formatNumber } from '@utils/formatters';
import { getStoryStatusColor } from '@utils/helpers';

import type { Story } from '@/types/story';
import type { User } from '@/types/user';

interface StoryCardProps {
  story: Story;
  currentUser?: User;
  onLike?: (storyId: string) => void;
  onDelete?: (storyId: string) => void;
  onEdit?: (storyId: string) => void;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  currentUser,
  onLike,
  onDelete,
  onEdit,
  variant = 'default',
  showActions = true,
}) => {
  /* --------- derived flags --------- */
  const loggedInId = currentUser?.id ?? '';
  const isOwner = loggedInId === story.authorId;
  const isLiked = (story.likedBy ?? []).includes(loggedInId);
  const canEdit = isOwner && story.status !== 'published';

  /* --------- dropdown items --------- */
  const dropdownItems = [
    ...(canEdit
      ? [
          {
            label: 'Edit Story',
            value: 'edit',
            onClick: () => onEdit?.(story.id),
          },
        ]
      : []),
    ...(isOwner
      ? [
          {
            label: 'Delete Story',
            value: 'delete',
            onClick: () => onDelete?.(story.id),
          },
        ]
      : []),
    {
      label: 'Share Story',
      value: 'share',
      onClick: () =>
        navigator.share?.({ title: story.title, url: `/story/${story.id}` }),
    },
  ];

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(story.id);
  };

  /* --------- COMPACT card --------- */
  if (variant === 'compact') {
    return (
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <Link href={`/story/${story.id}`}>
          <Card className="cursor-pointer p-4 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                  {story.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(story.createdAt)}
                </p>
              </div>

              <Badge variant={getStoryStatusColor(story.status)} size="sm">
                {story.status}
              </Badge>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  /* --------- DEFAULT / FEATURED card --------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={variant === 'featured' ? 'col-span-2' : ''}
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Cover */}
        <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute left-4 top-4">
            <Badge variant={getStoryStatusColor(story.status)} size="sm">
              {story.status}
            </Badge>
          </div>

          {showActions && (
            <div className="absolute right-4 top-4">
              <Dropdown
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <MoreVertical size={16} />
                  </Button>
                }
                items={dropdownItems}
                align="right"
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Title & excerpt */}
          <div className="mb-4">
            <Link href={`/story/${story.id}`}>
              <h3 className="line-clamp-2 cursor-pointer text-xl font-bold text-gray-900 transition-colors hover:text-purple-600 dark:text-white dark:hover:text-purple-400">
                {story.title}
              </h3>
            </Link>
            <p className="mt-2 line-clamp-3 text-gray-600 dark:text-gray-400">
              {story.content.substring(0, 150)}…
            </p>
          </div>

          {/* First 3 elements */}
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(story.elements)
              .slice(0, 3)
              .map(([k, v]) => (
                <Badge key={k} variant="default" size="sm">
                  {v}
                </Badge>
              ))}
            {Object.keys(story.elements).length > 3 && (
              <Badge variant="default" size="sm">
                +{Object.keys(story.elements).length - 3} more
              </Badge>
            )}
          </div>

          {/* Author & stats */}
          <div className="flex items-center justify-between">
            {/* Author */}
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-medium text-white">
                {story.authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {story.authorName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(story.createdAt)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
              {/* Likes */}
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 text-sm transition-colors hover:text-red-500 ${
                  isLiked ? 'text-red-500' : ''
                }`}
              >
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{formatNumber(story.likes)}</span>
              </button>

              {/* Views */}
              <div className="flex items-center space-x-1 text-sm">
                <Eye size={16} />
                <span>{formatNumber(story.views)}</span>
              </div>

              {/* Comments */}
              <div className="flex items-center space-x-1 text-sm">
                <MessageCircle size={16} />
                <span>{formatNumber(story.comments ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* AI assessment */}
          {story.assessment && (
            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  AI Assessment
                </span>
                <div className="flex items-center space-x-1">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium">
                    {story.assessment.overallScore}/100
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
