// app/(dashboard)/story/[id]/StoryViewClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Download,
  Share2,
  Eye,
  Calendar,
  Clock,
  Star,
  Award,
  MessageCircle,
  BookOpen,
  Target,
  Sparkles,
  ThumbsUp,
  Flag,
  Printer,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { ProgressBar } from '@components/ui/progress-bar';
import { StoryViewer } from '@components/stories/StoryViewer';
import { CommentSystem } from '@components/stories/CommentSystem';
import { AssessmentModal } from '@components/stories/AssessmentModal';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';

import { formatDate, formatNumber } from '@utils/formatters';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import type { User } from '@/types/user';
import type { Story } from '@/types/story';
import type { Comment } from '@/types/comment';

interface StoryViewProps {
  story: Story;
  user: User;
  comments: Comment[];
  isOwner: boolean;
  canComment: boolean;
}

export default function StoryViewClient({
  story,
  user,
  comments,
  isOwner,
  canComment,
}: StoryViewProps) {
  const router = useRouter();
  const [showAssessment, setShowAssessment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story.likeCount || 0);

  useEffect(() => {
    trackEvent(TRACKING_EVENTS.STORY_VIEW, {
      userId: user._id,
      storyId: story.id,
      isOwner,
    });

    // Check if user has liked this story
    setIsLiked(story.likedBy?.includes(user._id) || false);
  }, [story.id, story.likedBy, user._id, isOwner]);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/stories/${story.id}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setIsLiked(result.liked);
        setLikeCount(result.likeCount);

        trackEvent(TRACKING_EVENTS.STORY_LIKE, {
          userId: user._id,
          storyId: story.id,
          liked: result.liked,
        });
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to update like');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Check out "${story.title}" on MINTOONS!`,
      text: story.description || `Read this amazing story by ${user.name}`,
      url: `${window.location.origin}/story/${story.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Story link copied to clipboard!');
      }

      trackEvent(TRACKING_EVENTS.STORY_SHARE, {
        userId: user._id,
        storyId: story.id,
        method: navigator.share ? 'native_share' : 'clipboard',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDownload = async (format: 'pdf' | 'word') => {
    try {
      const response = await fetch(
        `/api/stories/${story.id}/export?format=${format}`
      );

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

        toast.success(`Story downloaded as ${format.toUpperCase()}!`);

        trackEvent(TRACKING_EVENTS.DOWNLOAD, {
          userId: user._id,
          storyId: story.id,
          format,
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download story');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'reviewing':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <FadeIn>
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {story.title}
              </h1>
              <Badge variant={getStatusColor(story.status)} size="sm">
                {story.status}
              </Badge>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(story.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{story.readingTime || 5} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{formatNumber(story.wordCount || 0)} words</span>
              </div>
              {story.averageRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  <span>{story.averageRating}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Like Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'border-red-200 text-red-600' : ''}
            >
              <ThumbsUp
                className={`mr-1 h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
              />
              {likeCount}
            </Button>

            {/* Share Button */}
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-1 h-4 w-4" />
              Share
            </Button>

            {/* Download Dropdown */}
            <div className="group relative">
              <Button variant="outline" size="sm">
                <Download className="mr-1 h-4 w-4" />
                Download
              </Button>
              <div className="invisible absolute right-0 top-full z-10 mt-1 w-32 rounded-md border border-gray-200 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <button
                  onClick={() => handleDownload('pdf')}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <span>📄</span> PDF
                </button>
                <button
                  onClick={() => handleDownload('word')}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <span>📝</span> Word
                </button>
              </div>
            </div>

            {/* Edit Button (Owner only) */}
            {isOwner && story.status === 'draft' && (
              <Link href={`/dashboard/story/${story.id}/edit`}>
                <Button size="sm">
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Story Content */}
          <FadeIn delay={0.1}>
            <StoryViewer
              story={story}
              comments={comments}
              canComment={canComment}
              onHighlight={(text, position) => {
                // Handle text highlighting for comments
                console.log('Highlighted text:', text, position);
              }}
            />
          </FadeIn>

          {/* AI Assessment */}
          {story.aiAssessment && (
            <SlideIn direction="up" delay={0.2}>
              <Card className="mt-8 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI Assessment
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAssessment(true)}
                  >
                    View Details
                  </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <div className="mb-1 text-3xl font-bold text-blue-600">
                      {story.aiAssessment.grammarScore}%
                    </div>
                    <div className="text-sm text-gray-600">Grammar</div>
                    <ProgressBar
                      value={story.aiAssessment.grammarScore}
                      max={100}
                      variant="blue"
                      size="sm"
                      className="mt-2"
                    />
                  </div>

                  <div className="text-center">
                    <div className="mb-1 text-3xl font-bold text-purple-600">
                      {story.aiAssessment.creativityScore}%
                    </div>
                    <div className="text-sm text-gray-600">Creativity</div>
                    <ProgressBar
                      value={story.aiAssessment.creativityScore}
                      max={100}
                      variant="purple"
                      size="sm"
                      className="mt-2"
                    />
                  </div>

                  <div className="text-center">
                    <div className="mb-1 text-3xl font-bold text-green-600">
                      {story.aiAssessment.overallScore}%
                    </div>
                    <div className="text-sm text-gray-600">Overall</div>
                    <ProgressBar
                      value={story.aiAssessment.overallScore}
                      max={100}
                      variant="green"
                      size="sm"
                      className="mt-2"
                    />
                  </div>
                </div>

                {story.aiAssessment.feedback && (
                  <div className="mt-6 rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium text-gray-900">
                      AI Feedback:
                    </h4>
                    <p className="text-gray-700">
                      {story.aiAssessment.feedback}
                    </p>
                  </div>
                )}
              </Card>
            </SlideIn>
          )}

          {/* Comments Section */}
          {(canComment || comments.length > 0) && (
            <SlideIn direction="up" delay={0.3}>
              <Card className="mt-8 p-6">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Mentor Comments ({comments.length})
                </h3>

                <CommentSystem
                  storyId={story.id}
                  comments={comments}
                  canComment={canComment}
                  currentUser={user}
                />
              </Card>
            </SlideIn>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Story Elements */}
            <SlideIn direction="right" delay={0.2}>
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Story Elements
                </h3>

                {story.elements ? (
                  <div className="space-y-3">
                    {Object.entries(story.elements).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm capitalize text-gray-600">
                          {key}:
                        </span>
                        <Badge variant="outline" size="sm">
                          {value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No story elements available
                  </p>
                )}
              </Card>
            </SlideIn>

            {/* Story Stats */}
            <SlideIn direction="right" delay={0.3}>
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Story Statistics
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Views:</span>
                    <span className="font-medium">
                      {formatNumber(story.viewCount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Likes:</span>
                    <span className="font-medium">
                      {formatNumber(likeCount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Comments:</span>
                    <span className="font-medium">{comments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Word Count:</span>
                    <span className="font-medium">
                      {formatNumber(story.wordCount || 0)}
                    </span>
                  </div>
                  {story.readingLevel && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Reading Level:
                      </span>
                      <span className="font-medium">{story.readingLevel}</span>
                    </div>
                  )}
                </div>
              </Card>
            </SlideIn>

            {/* Quick Actions */}
            <SlideIn direction="right" delay={0.4}>
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.print()}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Story
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          story.content || ''
                        );
                        toast.success('Story text copied to clipboard!');
                      } catch (error) {
                        toast.error('Failed to copy text');
                      }
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Text
                  </Button>

                  {!isOwner && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={() => {
                        // Report inappropriate content
                        toast.info(
                          'Thank you for reporting. We will review this content.'
                        );
                      }}
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Report Story
                    </Button>
                  )}
                </div>
              </Card>
            </SlideIn>

            {/* Related Stories */}
            <SlideIn direction="right" delay={0.5}>
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  More Stories
                </h3>

                <div className="space-y-3">
                  <Link href="/dashboard/create-stories">
                    <div className="group cursor-pointer rounded-lg border border-dashed border-purple-300 p-3 transition-colors hover:border-purple-500 hover:bg-purple-50">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Write New Story
                          </div>
                          <div className="text-xs text-gray-600">
                            Create with AI guidance
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/dashboard/my-stories">
                    <div className="group cursor-pointer rounded-lg border border-dashed border-blue-300 p-3 transition-colors hover:border-blue-500 hover:bg-blue-50">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            My Stories
                          </div>
                          <div className="text-xs text-gray-600">
                            View all your stories
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/explore-stories">
                    <div className="group cursor-pointer rounded-lg border border-dashed border-green-300 p-3 transition-colors hover:border-green-500 hover:bg-green-50">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200">
                          <Target className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Explore Stories
                          </div>
                          <div className="text-xs text-gray-600">
                            Read others' stories
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>
            </SlideIn>
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      {story.aiAssessment && (
        <AssessmentModal
          isOpen={showAssessment}
          onClose={() => setShowAssessment(false)}
          assessment={story.aiAssessment}
          storyTitle={story.title}
        />
      )}
    </div>
  );
}
