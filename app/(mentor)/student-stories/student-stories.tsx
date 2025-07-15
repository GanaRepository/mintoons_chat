// app/(mentor)/student-stories/StudentStoriesClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BookOpen,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Calendar,
  User,
  Star,
  Clock,
  Flag,
  CheckCircle,
  AlertCircle,
  Users,
  Grid3X3,
  List,
  ArrowRight,
  Edit,
  Target
} from 'lucide-react';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';

import { formatDate, formatNumber } from '@utils/formatters';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import type { User as UserType } from '@/types/user';
import type { Story } from '@/types/story';

interface StudentStoriesProps {
  mentor: UserType;
  students: UserType[];
  stories: Story[];
  commentsByStory: Record<string, any[]>;
  filters: {
    filter: string;
    student: string;
    status: string;
  };
}

type ViewMode = 'grid' | 'list';

export default function StudentStoriesClient({
  mentor,
  students,
  stories,
  commentsByStory,
  filters
}: StudentStoriesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStories, setFilteredStories] = useState(stories);

  useEffect(() => {
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page: 'student-stories',
      mentorId: mentor._id,
      totalStories: stories.length,
      filter: filters.filter,
    });
  }, [mentor._id, stories.length, filters.filter]);

  useEffect(() => {
    let filtered = [...stories];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getAuthorName(story.authorId).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStories(filtered);
  }, [stories, searchQuery]);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams?.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/student-stories?${params.toString()}`);
  };

  const getStoryStatusColor = (story: Story) => {
    if ((story as any).needsMentorReview) return 'warning';
    if (story.status === 'published') return 'success';
    if (story.status === 'draft') return 'default';
    return 'default';
  };

  const getStoryPriority = (story: Story) => {
    if ((story as any).needsMentorReview) return 'high';
    const daysSinceUpdate = Math.floor((Date.now() - new Date(story.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate > 3) return 'medium';
    return 'low';
  };

  const pendingCount = stories.filter(s => (s as any).needsMentorReview).length;
  const thisWeekCount = stories.filter(s => 
    new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  // Defensive: authorId may be string or object, so use helper to get name/age
  const getAuthorName = (author: any) => {
    if (!author) return '';
    if (typeof author === 'string') return '';
    if ('fullName' in author && author.fullName) return author.fullName;
    if ('name' in author && author.name) return author.name;
    if ('firstName' in author && author.firstName) return author.firstName + (author.lastName ? ' ' + author.lastName : '');
    return '';
  };
  const getAuthorAge = (author: any) => {
    if (!author) return '';
    if (typeof author === 'string') return '';
    if ('age' in author && author.age) return author.age;
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Student Stories
            </h1>
            <p className="text-xl text-gray-600">
              Review and provide feedback on your students' creative work
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <Badge variant="info" size="sm">
              {filteredStories.length} stories
            </Badge>
            {pendingCount > 0 && (
              <Badge variant="warning" size="sm">
                {pendingCount} pending review
              </Badge>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Quick Stats */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stories.length}</div>
                <div className="text-sm text-gray-600">Total Stories</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flag className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
                <div className="text-sm text-gray-600">Need Review</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{thisWeekCount}</div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{students.length}</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
            </div>
          </Card>
        </div>
      </FadeIn>

      {/* Filters and Controls */}
      <FadeIn delay={0.2}>
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search stories by title, content, or student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter by Type */}
            <select
              value={filters.filter}
              onChange={(e) => updateFilters({ filter: e.target.value })}
              className="w-full lg:w-48 border rounded-md p-2 text-gray-700"
            >
              <option value="all">All Stories</option>
              <option value="pending">Need Review</option>
              <option value="recent">Recent (7 days)</option>
              <option value="commented">My Comments</option>
            </select>

            {/* Filter by Student */}
            <select
              value={filters.student}
              onChange={(e) => updateFilters({ student: e.target.value })}
              className="w-full lg:w-48 border rounded-md p-2 text-gray-700"
            >
              <option value="all">All Students</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {getAuthorName(student)}
                </option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="w-full lg:w-48 border rounded-md p-2 text-gray-700"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="reviewing">Under Review</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Stories List/Grid */}
      {filteredStories.length === 0 ? (
        <FadeIn delay={0.3}>
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No stories found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filters.filter !== 'all' || filters.student !== 'all' || filters.status !== 'all'
                ? "Try adjusting your search or filters"
                : "Your students haven't written any stories yet"
              }
            </p>
            {stories.length === 0 && (
              <p className="text-sm text-gray-500">
                Encourage your students to start writing their first stories!
              </p>
            )}
          </Card>
        </FadeIn>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }`}>
          {filteredStories.map((story, index) => (
            <SlideIn key={story._id} direction="up" delay={0.1 * (index % 6)}>
              {viewMode === 'grid' ? (
                // Grid View
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  {/* Priority Indicator */}
                  {(story as any).needsMentorReview && (
                    <div className="mb-4">
                      <Badge variant="warning" size="sm" className="flex items-center gap-1 w-fit">
                        <Flag className="w-3 h-3" />
                        Needs Review
                      </Badge>
                    </div>
                  )}

                  {/* Story Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {story.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {getAuthorName(story.authorId).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {getAuthorName(story.authorId)}, age {getAuthorAge(story.authorId)}
                      </span>
                    </div>
                  </div>

                  {/* Story Preview */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {story.content}
                  </p>

                  {/* Story Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(story.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{story.readingTime || 5} min</span>
                      </div>
                    </div>
                    <Badge variant={getStoryStatusColor(story)} size="sm">
                      {story.status}
                    </Badge>
                  </div>

                  {/* AI Assessment */}
                  {typeof story.assessment === 'object' && story.assessment && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">AI Assessment</span>
                        <span className="text-sm font-bold text-green-600">
                          {/* --- Fix assessment property rendering: only render score spans if the property exists and is a number --- */}
                          {typeof story.assessment === 'object' && story.assessment && typeof (story.assessment as any).overallScore === 'number' && (
                            <span>{(story.assessment as any).overallScore}%</span>
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium text-blue-600">
                            {typeof story.assessment === 'object' && story.assessment && typeof (story.assessment as any).grammarScore === 'number' && (
                              <span>{(story.assessment as any).grammarScore}%</span>
                            )}
                          </div>
                          <div className="text-gray-500">Grammar</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-purple-600">
                            {typeof story.assessment === 'object' && story.assessment && typeof (story.assessment as any).creativityScore === 'number' && (
                              <span>{(story.assessment as any).creativityScore}%</span>
                            )}
                          </div>
                          <div className="text-gray-500">Creativity</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">
                            {'overallScore' in story.assessment && (
                              <span>{(story.assessment as { overallScore?: number }).overallScore}%</span>
                            )}
                          </div>
                          <div className="text-gray-500">Overall</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments Count */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MessageCircle className="w-4 h-4" />
                      <span>{commentsByStory[story._id]?.length || 0} comments</span>
                    </div>
                    {story.wordCount && (
                      <span className="text-xs text-gray-500">
                        {formatNumber(story.wordCount)} words
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/student-stories/${story._id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </Link>
                    
                    {commentsByStory[story._id]?.length > 0 && (
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                // List View
                <Card className="p-6 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start gap-6">
                    {/* Priority & Status */}
                    <div className="flex flex-col gap-2">
                      {(story as any).needsMentorReview ? (
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      ) : (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600">
                              <Link href={`/student-stories/${story._id}`}>
                                {story.title}
                              </Link>
                            </h3>
                            {(story as any).needsMentorReview && (
                              <Badge variant="warning" size="sm">
                                <Flag className="w-3 h-3 mr-1" />
                                Review Needed
                              </Badge>
                            )}
                            <Badge variant={getStoryStatusColor(story)} size="sm">
                              {story.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  {getAuthorName(story.authorId).charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span>{getAuthorName(story.authorId)}, age {getAuthorAge(story.authorId)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(story.updatedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{story.readingTime || 5} min read</span>
                            </div>
                            {story.wordCount && (
                              <span>{formatNumber(story.wordCount)} words</span>
                            )}
                          </div>
                        </div>

                        {typeof story.assessment === 'object' && story.assessment && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {/* --- Fix assessment property rendering: only render score spans if the property exists and is a number --- */}
                              {typeof story.assessment === 'object' && story.assessment && typeof (story.assessment as any).overallScore === 'number' && (
                                <span>{(story.assessment as any).overallScore}%</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">AI Score</div>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {story.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MessageCircle className="w-4 h-4" />
                            <span>{commentsByStory[story._id]?.length || 0} comments</span>
                          </div>
                          
                          {story.assessment && (
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-blue-600">
                                Grammar: {typeof story.assessment === 'object' && story.assessment && 'grammarScore' in story.assessment && (
                                  <span>{(story.assessment as { grammarScore?: number }).grammarScore}%</span>
                                )}
                              </span>
                              <span className="text-purple-600">
                                Creativity: {typeof story.assessment === 'object' && story.assessment && 'creativityScore' in story.assessment && (
                                  <span>{(story.assessment as { creativityScore?: number }).creativityScore}%</span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/student-stories/${story._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </Link>
                          
                          {commentsByStory[story._id]?.some(c => c.commenterId === mentor._id) && (
                            <Badge variant="info" size="sm">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Commented
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </SlideIn>
          ))}
        </div>
      )}

      {/* Load More / Pagination */}
      {filteredStories.length >= 50 && (
        <FadeIn delay={0.5}>
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Stories
            </Button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}