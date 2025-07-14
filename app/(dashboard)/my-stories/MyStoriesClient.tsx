// app/(dashboard)/my-stories/MyStoriesClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  Sparkles,
  ArrowRight,
  Download,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { StoryCard } from '@components/stories/StoryCard';
import { StoryFilters } from '@components/stories/StoryFilters';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';
import type { StoryAssessment } from '../../../types/assessment';
import { formatDate, formatNumber } from '@utils/formatters';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import type { User } from '@/types/user';
import type { Story } from '@/types/story';

interface MyStoriesProps {
  user: User;
  stories: Story[];
  hasStories: boolean;
  sampleStories: any[];
}

type ViewMode = 'grid' | 'list';
type SortBy = 'recent' | 'title' | 'status' | 'rating';

export default function MyStoriesClient({
  user,
  stories,
  hasStories,
  sampleStories,
}: MyStoriesProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredStories, setFilteredStories] = useState(stories);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page: 'my-stories',
      hasStories,
      storyCount: stories.length,
    });
  }, [hasStories, stories.length]);

  useEffect(() => {
    let filtered = [...stories];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        story =>
          story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          story.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(story => story.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'rating':
          // Defensive: If assessment exists and is object, use overallScore for sorting
          const aScore = typeof a.assessment === 'object' && a.assessment !== null && 'overallScore' in a.assessment ? (a.assessment as any).overallScore : 0;
          const bScore = typeof b.assessment === 'object' && b.assessment !== null && 'overallScore' in b.assessment ? (b.assessment as any).overallScore : 0;
          return bScore - aScore;
        default:
          return 0;
      }
    });

    setFilteredStories(filtered);
  }, [stories, searchQuery, statusFilter, sortBy]);

  const handleStoryAction = async (
    storyId: string,
    action: 'delete' | 'edit' | 'view' | 'share'
  ) => {
    switch (action) {
      case 'delete':
        if (
          confirm(
            'Are you sure you want to delete this story? This action cannot be undone.'
          )
        ) {
          try {
            const response = await fetch(`/api/stories/${storyId}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              toast.success('Story deleted successfully');
              // Remove from local state
              setFilteredStories(prev => prev.filter(s => s._id !== storyId));

              trackEvent(TRACKING_EVENTS.STORY_DELETE, {
                userId: user._id,
                storyId,
              });
            } else {
              throw new Error('Failed to delete story');
            }
          } catch (error) {
            console.error('Delete story error:', error);
            toast.error('Failed to delete story');
          }
        }
        break;

      case 'edit':
        window.location.href = `/dashboard/story/${storyId}/edit`;
        break;

      case 'view':
        window.location.href = `/dashboard/story/${storyId}`;
        break;

      case 'share':
        try {
          await navigator.share({
            title: 'Check out my story on MINTOONS!',
            url: `${window.location.origin}/story/${storyId}`,
          });

          trackEvent(TRACKING_EVENTS.STORY_SHARE, {
            userId: user._id,
            storyId,
            method: 'native_share',
          });
        } catch (error) {
          // Fallback to clipboard
          navigator.clipboard.writeText(
            `${window.location.origin}/story/${storyId}`
          );
          toast.success('Story link copied to clipboard!');
        }
        break;
    }
  };

  const handleBulkAction = async (action: 'delete' | 'export') => {
    if (selectedStories.length === 0) {
      toast.error('Please select stories first');
      return;
    }

    switch (action) {
      case 'delete':
        if (
          confirm(
            `Are you sure you want to delete ${selectedStories.length} stories? This action cannot be undone.`
          )
        ) {
          try {
            const response = await fetch('/api/stories/bulk-delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ storyIds: selectedStories }),
            });

            if (response.ok) {
              toast.success(
                `${selectedStories.length} stories deleted successfully`
              );
              setFilteredStories(prev =>
                prev.filter(s => !selectedStories.includes(s._id))
              );
              setSelectedStories([]);
            } else {
              throw new Error('Failed to delete stories');
            }
          } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('Failed to delete stories');
          }
        }
        break;

      case 'export':
        try {
          const response = await fetch('/api/stories/bulk-export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storyIds: selectedStories }),
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my-stories-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Stories exported successfully!');
            setSelectedStories([]);
          } else {
            throw new Error('Failed to export stories');
          }
        } catch (error) {
          console.error('Export error:', error);
          toast.error('Failed to export stories');
        }
        break;
    }
  };

  // No stories yet - show sample stories
  if (!hasStories) {
    return (
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
              <BookOpen className="h-10 w-10 text-purple-600" />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Welcome to Your Story Library!
            </h1>
            <p className="mb-6 text-xl text-gray-600">
              You haven't written any stories yet. Check out these sample
              stories for inspiration, then create your first masterpiece!
            </p>
            <Link href="/dashboard/create-stories">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="mr-2 h-5 w-5" />
                Write Your First Story
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Sample Stories for Inspiration
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sampleStories.map((story, index) => (
                <SlideIn key={story._id} direction="up" delay={0.1 * index}>
                  <Card className="p-6 transition-shadow duration-300 hover:shadow-lg">
                    <div className="mb-4 flex items-start justify-between">
                      <Badge variant="default" size="sm">
                        {story.genre}
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">
                          {story.rating}
                        </span>
                      </div>
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900">
                      {story.title}
                    </h3>

                    <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                      {story.content}
                    </p>

                    <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
                      <span>{story.authorName}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{story.readingTime} min</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // Open sample story in modal or new page
                        window.open(`/sample-story/${story._id}`, '_blank');
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Read Story
                    </Button>
                  </Card>
                </SlideIn>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-8">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-purple-600" />
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Ready to Start Writing?
              </h3>
              <p className="mb-6 text-gray-600">
                Create your own amazing stories with AI guidance. Choose your
                elements and let your imagination soar!
              </p>
              <Link href="/dashboard/create-stories">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Story
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </Card>
          </div>
        </FadeIn>
      </div>
    );
  }

  // User has stories - show full interface
  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <FadeIn>
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">
              My Stories
            </h1>
            <p className="text-xl text-gray-600">
              {filteredStories.length} of {stories.length} stories
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 lg:mt-0">
            <Link href="/dashboard/create-stories">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Plus className="mr-2 h-4 w-4" />
                New Story
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Filters and Controls */}
      <FadeIn delay={0.1}>
        <Card className="mb-8 p-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search your stories..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full lg:w-48"
              options={[
                { value: 'all', label: 'All Stories' },
                { value: 'draft', label: 'Drafts' },
                { value: 'published', label: 'Published' },
                { value: 'reviewing', label: 'Under Review' },
              ]}
            />

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={value => setSortBy(value as SortBy)}
              className="w-full lg:w-48"
              options={[
                { value: 'recent', label: 'Most Recent' },
                { value: 'title', label: 'Title A-Z' },
                { value: 'status', label: 'Status' },
                { value: 'rating', label: 'Highest Rated' },
              ]}
            />

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <StoryFilters
                totalStories={stories.length}
                filteredCount={filteredStories.length}
                onFiltersChange={filters => {
                  // Apply advanced filters
                  console.log('Advanced filters:', filters);
                }}
              />
            </div>
          )}
        </Card>
      </FadeIn>

      {/* Bulk Actions */}
      {selectedStories.length > 0 && (
        <FadeIn>
          <Card className="mb-6 border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedStories.length} stories selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStories([])}
                >
                  Clear Selection
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </FadeIn>
      )}

      {/* Stories Grid/List */}
      {filteredStories.length === 0 ? (
        <FadeIn delay={0.2}>
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No stories found
            </h3>
            <p className="mb-6 text-gray-600">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : "You haven't written any stories yet"}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/dashboard/create-stories">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Story
                </Button>
              </Link>
            )}
          </Card>
        </FadeIn>
      ) : (
        <div
          className={`${
            viewMode === 'grid'
              ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          }`}
        >
          {filteredStories.map((story, index) => (
            <SlideIn key={story._id} direction="up" delay={0.1 * index}>
              {viewMode === 'grid' ? (
                <div className="group relative">
                  {/* Selection Checkbox */}
                  <div className="absolute left-4 top-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedStories.includes(story._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedStories(prev => [...prev, story._id]);
                        } else {
                          setSelectedStories(prev =>
                            prev.filter(id => id !== story._id)
                          );
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 bg-white text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  <StoryCard
                    story={story}
                    currentUser={user}
                    onEdit={id => handleStoryAction(id, 'edit')}
                    onDelete={id => handleStoryAction(id, 'delete')}
                    variant="default"
                    showActions={true}
                  />
                </div>
              ) : (
                <Card className="p-6 transition-shadow duration-300 hover:shadow-md">
                  <div className="flex items-start gap-6">
                    {/* Selection Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedStories.includes(story._id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedStories(prev => [...prev, story._id]);
                          } else {
                            setSelectedStories(prev =>
                              prev.filter(id => id !== story._id)
                            );
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 bg-white text-purple-600 focus:ring-purple-500"
                      />
                    </div>

                    {/* Story Content */}
                    <div className="flex-1">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="cursor-pointer text-xl font-bold text-gray-900 hover:text-purple-600">
                            <Link href={`/dashboard/story/${story._id}`}>
                              {story.title}
                            </Link>
                          </h3>
                          <Badge
                            variant={
                              story.status === 'published'
                                ? 'success'
                                : story.status === 'draft'
                                  ? 'warning'
                                  : 'default'
                            }
                            size="sm"
                          >
                            {story.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                        {/* Defensive: Only show overallScore if assessment is object and has overallScore */}
                        {typeof story.assessment === 'object' && story.assessment !== null && 'overallScore' in story.assessment && (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">
                              {(story.assessment as any).overallScore}
                            </span>
                          </div>
                        )}
                        </div>
                      </div>

                      <p className="mb-4 line-clamp-2 text-gray-600">
                        {story.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(story.updatedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{story.readingTime || 5} min read</span>
                          </div>
                          {story.wordCount && (
                            <span>{formatNumber(story.wordCount)} words</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStoryAction(story._id, 'view')}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>

                          {story.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStoryAction(story._id, 'edit')
                              }
                            >
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStoryAction(story._id, 'share')
                            }
                          >
                            <Share2 className="mr-1 h-4 w-4" />
                            Share
                          </Button>
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
      {filteredStories.length > 0 && filteredStories.length >= 12 && (
        <FadeIn delay={0.5}>
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              Load More Stories
            </Button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
