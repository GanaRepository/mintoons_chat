// app/components/stories/CommentSystem.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Reply,
  Heart,
  MoreVertical,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import { Dropdown } from '@components/ui/dropdown';
import { Badge } from '@components/ui/badge';
import { formatDate, formatTimeAgo } from '@utils/formatters';
import { validateComment } from '@utils/validators';
import type { Comment, CommentType } from '../../../types/comment';

interface CommentSystemProps {
  storyId: string;
  onClose: () => void;
  isReadOnly?: boolean;
}

export const CommentSystem: React.FC<CommentSystemProps> = ({
  storyId,
  onClose,
  isReadOnly = false,
}) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [storyId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isLoading) return;

    const isValid = validateComment({ content: newComment });
    if (!isValid) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          type: 'general' as CommentType,
        }),
      });

      if (response.ok) {
        setNewComment('');
        await fetchComments();
        // app/components/stories/CommentSystem.tsx (continued)
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || isLoading) return;

    const isValid = validateComment({ content: replyText });
    if (!isValid) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyText,
          parentId,
          type: 'reply' as CommentType,
        }),
      });

      if (response.ok) {
        setReplyText('');
        setReplyTo(null);
        await fetchComments();
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/stories/${storyId}/comments/${commentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: editText }),
        }
      );

      if (response.ok) {
        setEditingComment(null);
        setEditText('');
        await fetchComments();
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(
        `/api/stories/${storyId}/comments/${commentId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        await fetchComments();
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/stories/${storyId}/comments/${commentId}/like`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        await fetchComments();
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = comment.authorId === session?.user.id;
    const isLiked = comment.likes?.includes(session?.user.id || '');
    const isEditing = editingComment === comment._id;

    const dropdownItems = [
      ...(isOwner
        ? [
            {
              label: 'Edit',
              value: 'edit',
              icon: <Edit size={14} />,
              onClick: () => {
                setEditingComment(comment._id);
                setEditText(comment.content);
              },
            },
            {
              label: 'Delete',
              value: 'delete',
              icon: <Trash2 size={14} />,
              onClick: () => handleDeleteComment(comment._id),
            },
          ]
        : []),
      {
        label: 'Report',
        value: 'report',
        onClick: () => {
          // Handle report functionality
        },
      },
    ];

    return (
      <motion.div
        key={comment._id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4 dark:border-gray-700' : ''}`}
      >
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-medium text-white">
              {comment.authorName?.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              {/* Header */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {comment.authorName}
                  </span>
                  {comment.authorRole === 'mentor' && (
                    <Badge variant="info" size="sm">
                      Mentor
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>

                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm" className="p-1">
                      <MoreVertical size={14} />
                    </Button>
                  }
                  items={dropdownItems}
                  align="right"
                />
              </div>

              {/* Content */}
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    className="text-sm"
                    placeholder="Edit your comment..."
                  />
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleEditComment(comment._id)}
                      disabled={!editText.trim() || isLoading}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingComment(null);
                        setEditText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
              )}

              {/* Actions */}
              {!isEditing && !isReadOnly && (
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <button
                    onClick={() => handleLikeComment(comment._id)}
                    className={`flex items-center space-x-1 transition-colors hover:text-red-500 ${
                      isLiked ? 'text-red-500' : ''
                    }`}
                  >
                    <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{comment.likes?.length || 0}</span>
                  </button>

                  {!isReply && (
                    <button
                      onClick={() =>
                        setReplyTo(replyTo === comment._id ? null : comment._id)
                      }
                      className="flex items-center space-x-1 transition-colors hover:text-purple-500"
                    >
                      <Reply size={12} />
                      <span>Reply</span>
                    </button>
                  )}
                </div>
              )}

              {/* Reply Form */}
              {replyTo === comment._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2"
                >
                  <Textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="text-sm"
                  />
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSubmitReply(comment._id)}
                      disabled={!replyText.trim() || isLoading}
                    >
                      <Send size={12} className="mr-1" />
                      Reply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </Card>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 z-50 flex h-full w-96 flex-col border-l border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="text-purple-600" size={20} />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Comments
            </h3>
            <Badge variant="default" size="sm">
              {comments.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <AnimatePresence>
          {comments.length > 0 ? (
            comments
              .filter(comment => !comment.parentId) // Only top-level comments
              .map(comment => renderComment(comment))
          ) : (
            <div className="py-8 text-center">
              <MessageSquare
                size={48}
                className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
              />
              <p className="text-gray-500 dark:text-gray-400">
                No comments yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Be the first to share your thoughts!
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Comment Form */}
      {!isReadOnly && session && (
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="space-y-3">
            <Textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this story..."
              className="resize-none"
              maxLength={500}
              showCount
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {newComment.length}/500 characters
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isLoading}
                isLoading={isLoading}
              >
                <Send size={14} className="mr-2" />
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
