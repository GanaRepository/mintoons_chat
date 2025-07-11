// app/components/stories/StoryFilters.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Search,
  SortAsc,
  Calendar,
  Star,
  Eye,
  Heart,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { Badge } from '@components/ui/badge';
import { Card } from '@components/ui/card';
import { Dropdown } from '@components/ui/dropdown';
import { STORY_ELEMENTS } from '@utils/constants';
import type { StoryStatus, StoryElements } from '../../../types/story';

interface StoryFiltersProps {
  onFiltersChange: (filters: StoryFilters) => void;
  totalStories: number;
  filteredCount: number;
  isLoading?: boolean;
}

interface StoryFilters {
  search: string;
  status: StoryStatus | 'all';
  sortBy: 'newest' | 'oldest' | 'mostLiked' | 'mostViewed' | 'highestRated';
  genre?: string;
  character?: string;
  setting?: string;
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'all';
  minRating?: number;
}

export const StoryFilters: React.FC<StoryFiltersProps> = ({
  onFiltersChange,
  totalStories,
  filteredCount,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<StoryFilters>({
    search: '',
    status: 'all',
    sortBy: 'newest',
    dateRange: 'all',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const statusOptions = [
    { value: 'all', label: 'All Stories' },
    { value: 'draft', label: 'Drafts' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'published', label: 'Published' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'mostLiked', label: 'Most Liked' },
    { value: 'mostViewed', label: 'Most Viewed' },
    { value: 'highestRated', label: 'Highest Rated' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  const genreOptions = [
    { value: '', label: 'Any Genre' },
    ...STORY_ELEMENTS.genre.map(genre => ({
      value: genre.id,
      label: genre.name,
    })),
  ];

  const characterOptions = [
    { value: '', label: 'Any Character' },
    ...STORY_ELEMENTS.mainCharacter.map(char => ({
      value: char.id,
      label: char.name,
    })),
  ];

  const settingOptions = [
    { value: '', label: 'Any Setting' },
    ...STORY_ELEMENTS.setting.map(setting => ({
      value: setting.id,
      label: setting.name,
    })),
  ];

  const updateFilters = (newFilters: Partial<StoryFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);

    // Count active filters
    const count = Object.entries(updatedFilters).filter(([key, value]) => {
      if (key === 'search')
        return typeof value === 'string' && value.trim() !== '';
      if (key === 'status') return value !== 'all';
      if (key === 'sortBy') return value !== 'newest';
      if (key === 'dateRange') return value !== 'all';
      return value !== undefined && value !== '' && value !== null;
    }).length;
    setActiveFiltersCount(count);
  };

  const clearFilters = () => {
    const defaultFilters: StoryFilters = {
      search: '',
      status: 'all',
      sortBy: 'newest',
      dateRange: 'all',
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    setActiveFiltersCount(0);
    setShowAdvanced(false);
  };

  const clearSpecificFilter = (filterKey: keyof StoryFilters) => {
    const clearedValue =
      filterKey === 'status'
        ? 'all'
        : filterKey === 'sortBy'
          ? 'newest'
          : filterKey === 'dateRange'
            ? 'all'
            : '';
    updateFilters({ [filterKey]: clearedValue });
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search stories by title, content, or author..."
              value={filters.search}
              onChange={e => updateFilters({ search: e.target.value })}
              leftIcon={<Search size={20} />}
              className="w-full"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2">
            <Select
              options={statusOptions}
              value={filters.status}
              onChange={value =>
                updateFilters({ status: value as StoryStatus | 'all' })
              }
              className="min-w-[140px]"
            />

            <Select
              options={sortOptions}
              value={filters.sortBy}
              onChange={value => updateFilters({ sortBy: value as any })}
              className="min-w-[140px]"
            />

            <Button
              variant={showAdvanced ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="whitespace-nowrap"
            >
              <Filter size={16} className="mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="error" size="sm" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {filteredCount} of {totalStories} stories
            </span>
            {isLoading && (
              <div className="flex items-center space-x-1">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                <span>Loading...</span>
              </div>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={14} className="mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </Card>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4">
              <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
                Advanced Filters
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Select
                  label="Genre"
                  options={genreOptions}
                  value={filters.genre || ''}
                  onChange={value =>
                    updateFilters({ genre: value || undefined })
                  }
                />

                <Select
                  label="Character Type"
                  options={characterOptions}
                  value={filters.character || ''}
                  onChange={value =>
                    updateFilters({ character: value || undefined })
                  }
                />

                <Select
                  label="Setting"
                  options={settingOptions}
                  value={filters.setting || ''}
                  onChange={value =>
                    updateFilters({ setting: value || undefined })
                  }
                />

                <Select
                  label="Date Range"
                  options={dateRangeOptions}
                  value={filters.dateRange || 'all'}
                  onChange={value => updateFilters({ dateRange: value as any })}
                />
              </div>

              {/* Rating Filter */}
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minimum Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() =>
                        updateFilters({
                          minRating:
                            filters.minRating === rating ? undefined : rating,
                        })
                      }
                      className={`rounded p-1 transition-colors ${
                        (filters.minRating || 0) >= rating
                          ? 'text-yellow-500'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star
                        size={20}
                        fill={
                          (filters.minRating || 0) >= rating
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                    </button>
                  ))}
                  {filters.minRating && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFilters({ minRating: undefined })}
                      className="ml-2 text-gray-500"
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="purple" className="flex items-center space-x-1">
              <span>Search: "{filters.search}"</span>
              <button onClick={() => updateFilters({ search: '' })}>
                <X size={12} />
              </button>
            </Badge>
          )}

          {filters.status !== 'all' && (
            <Badge variant="purple" className="flex items-center space-x-1">
              <span>Status: {filters.status}</span>
              <button onClick={() => clearSpecificFilter('status')}>
                <X size={12} />
              </button>
            </Badge>
          )}

          {filters.genre && (
            <Badge variant="purple" className="flex items-center space-x-1">
              <span>Genre: {filters.genre}</span>
              <button onClick={() => clearSpecificFilter('genre')}>
                <X size={12} />
              </button>
            </Badge>
          )}

          {filters.character && (
            <Badge variant="purple" className="flex items-center space-x-1">
              <span>Character: {filters.character}</span>
              <button onClick={() => clearSpecificFilter('character')}>
                <X size={12} />
              </button>
            </Badge>
          )}

          {filters.setting && (
            <Badge variant="purple" className="flex items-center space-x-1">
              <span>Setting: {filters.setting}</span>
              <button onClick={() => clearSpecificFilter('setting')}>
                <X size={12} />
              </button>
            </Badge>
          )}

          {filters.minRating && (
            <Badge variant="purple" className="flex items-center space-x-1">
              <span>Min Rating: {filters.minRating}★</span>
              <button onClick={() => clearSpecificFilter('minRating')}>
                <X size={12} />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
