// app/(mentor)/student-progress/StudentProgressClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users,
  TrendingUp,
  BookOpen,
  Star,
  Calendar,
  Activity,
  Award,
  Target,
  Eye,
  MessageCircle,
  Clock,
  User,
  BarChart3,
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Fire,
  Crown
} from 'lucide-react';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Select } from '@components/ui/select';
import { ProgressBar } from '@components/ui/progress-bar';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';

import { formatDate, formatNumber } from '@utils/formatters';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import type { User as UserType } from '@/types/user';

interface StudentProgressProps {
  mentor: UserType;
  students: any[];
  totalStats: {
    totalStudents: number;
    activeStudents: number;
    totalStories: number;
    avgScoreAllStudents: number;
  };
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'stories' | 'score' | 'activity' | 'joined';

export default function StudentProgressClient({
  mentor,
  students,
  totalStats
}: StudentProgressProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredStudents, setFilteredStudents] = useState(students);

  useEffect(() => {
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page: 'student-progress',
      mentorId: mentor._id,
      totalStudents: totalStats.totalStudents,
    });
  }, [mentor._id, totalStats.totalStudents]);

  useEffect(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'active':
          filtered = filtered.filter(s => s.statistics.isActive);
          break;
        case 'inactive':
          filtered = filtered.filter(s => !s.statistics.isActive);
          break;
        case 'new':
          filtered = filtered.filter(s => s.statistics.joinedDaysAgo <= 7);
          break;
        case 'experienced':
          filtered = filtered.filter(s => s.statistics.totalStories >= 5);
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stories':
          return b.statistics.totalStories - a.statistics.totalStories;
        case 'score':
          return b.statistics.avgOverallScore - a.statistics.avgOverallScore;
        case 'activity':
          const aActive = new Date(a.lastActiveAt || 0).getTime();
          const bActive = new Date(b.lastActiveAt || 0).getTime();
          return bActive - aActive;
        case 'joined':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  }, [students, searchQuery, statusFilter, sortBy]);

  const getActivityStatus = (student: any) => {
    const daysSinceActive = Math.floor((Date.now() - new Date(student.lastActiveAt || 0).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActive <= 1) return { status: 'very-active', label: 'Very Active', color: 'bg-green-500' };
    if (daysSinceActive <= 3) return { status: 'active', label: 'Active', color: 'bg-blue-500' };
    if (daysSinceActive <= 7) return { status: 'somewhat-active', label: 'Somewhat Active', color: 'bg-yellow-500' };
    return { status: 'inactive', label: 'Inactive', color: 'bg-red-500' };
  };

  const getPerformanceTrend = (student: any) => {
    // Mock trend calculation - in real app, this would be based on historical data
    const recentAvg = student.statistics.avgOverallScore;
    if (recentAvg >= 85) return { trend: 'up', icon: ArrowUp, color: 'text-green-600' };
    if (recentAvg >= 70) return { trend: 'stable', icon: Minus, color: 'text-yellow-600' };
    return { trend: 'down', icon: ArrowDown, color: 'text-red-600' };
  };

  const overviewStats = [
    {
      label: 'Total Students',
      value: totalStats.totalStudents,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: `${totalStats.activeStudents} active`,
    },
    {
      label: 'Total Stories',
      value: totalStats.totalStories,
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      change: 'All students',
    },
    {
      label: 'Average Score',
      value: `${totalStats.avgScoreAllStudents}%`,
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      change: 'Class average',
    },
    {
      label: 'Active Rate',
      value: `${Math.round((totalStats.activeStudents / Math.max(totalStats.totalStudents, 1)) * 100)}%`,
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      change: 'Last 7 days',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Student Progress
          </h1>
          <p className="text-xl text-gray-600">
            Track the writing development of your {totalStats.totalStudents} assigned students
          </p>
        </div>
      </FadeIn>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewStats.map((stat, index) => (
          <FadeIn key={stat.label} delay={0.1 * index}>
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Filters and Controls */}
      <FadeIn delay={0.2}>
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full lg:w-48"
            >
              <option value="all">All Students</option>
              <option value="active">Active (7 days)</option>
              <option value="inactive">Inactive</option>
              <option value="new">New Students</option>
              <option value="experienced">Experienced (5+ stories)</option>
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full lg:w-48"
            >
              <option value="activity">Recent Activity</option>
              <option value="name">Name A-Z</option>
              <option value="stories">Most Stories</option>
              <option value="score">Highest Score</option>
              <option value="joined">Recently Joined</option>
            </Select>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Students Grid/List */}
      {filteredStudents.length === 0 ? (
        <FadeIn delay={0.3}>
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No students found
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' 
                ? "Try adjusting your search or filters"
                : "You don't have any assigned students yet"
              }
            </p>
          </Card>
        </FadeIn>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }`}>
          {filteredStudents.map((student, index) => {
            const activityStatus = getActivityStatus(student);
            const performanceTrend = getPerformanceTrend(student);

            return (
              <SlideIn key={student._id} direction="up" delay={0.1 * (index % 6)}>
                {viewMode === 'grid' ? (
                  // Grid View
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    {/* Student Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-600">Age {student.age}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${activityStatus.color}`} title={activityStatus.label} />
                        {student.streak?.current > 0 && (
                          <div className="flex items-center gap-1 text-orange-500">
                            <Fire className="w-4 h-4" />
                            <span className="text-sm font-medium">{student.streak.current}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {student.statistics.totalStories}
                        </div>
                        <div className="text-xs text-gray-600">Stories</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-2xl font-bold text-green-600">
                            {student.statistics.avgOverallScore}%
                          </span>
                          <performanceTrend.icon className={`w-4 h-4 ${performanceTrend.color}`} />
                        </div>
                        <div className="text-xs text-gray-600">Avg Score</div>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Writing Level</span>
                          <span className="font-medium">{student.level || 1}</span>
                        </div>
                        <ProgressBar
                          value={(student.points || 0) % 1000}
                          max={1000}
                          variant="purple"
                          size="sm"
                        />
                      </div>

                      {student.statistics.avgOverallScore > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Performance</span>
                            <span className="font-medium">{student.statistics.avgOverallScore}%</span>
                          </div>
                          <ProgressBar
                            value={student.statistics.avgOverallScore}
                            max={100}
                            variant="green"
                            size="sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Recent Activity */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Recent Activity</div>
                      {student.statistics.recentStories > 0 ? (
                        <div className="text-sm text-green-600">
                          {student.statistics.recentStories} stories this week
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Last active {formatDate(student.lastActiveAt || student.createdAt, 'relative')}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/student-progress/${student._id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      
                      <Link href={`/student-stories?student=${student._id}`}>
                        <Button variant="outline" size="sm">
                          <BookOpen className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ) : (
                  // List View
                  <Card className="p-6 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-6">
                      {/* Student Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                            <Badge variant="outline" size="sm">Age {student.age}</Badge>
                            <div className={`w-2 h-2 rounded-full ${activityStatus.color}`} title={activityStatus.label} />
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span>Joined {formatDate(student.createdAt, 'relative')}</span>
                            <span>Level {student.level || 1}</span>
                            {student.streak?.current > 0 && (
                              <div className="flex items-center gap-1 text-orange-500">
                                <Fire className="w-3 h-3" />
                                <span>{student.streak.current} day streak</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {student.statistics.totalStories}
                          </div>
                          <div className="text-xs text-gray-600">Stories</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-2xl font-bold text-green-600">
                              {student.statistics.avgOverallScore}%
                            </span>
                            <performanceTrend.icon className={`w-4 h-4 ${performanceTrend.color}`} />
                          </div>
                          <div className="text-xs text-gray-600">Avg Score</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {student.statistics.recentStories}
                          </div>
                          <div className="text-xs text-gray-600">This Week</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/student-progress/${student._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </Link>
                        
                        <Link href={`/student-stories?student=${student._id}`}>
                          <Button variant="outline" size="sm">
                            <BookOpen className="w-4 h-4 mr-1" />
                            Stories
                          </Button>
                        </Link>
                        
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </Card>
                )}
              </SlideIn>
            );
          })}
        </div>
      )}

      {/* Summary Card */}
      {filteredStudents.length > 0 && (
        <FadeIn delay={0.5}>
          <Card className="p-6 mt-8 bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Class Summary
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {Math.round((totalStats.activeStudents / Math.max(totalStats.totalStudents, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Students Active This Week</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {Math.round(totalStats.totalStories / Math.max(totalStats.totalStudents, 1))}
                </div>
                <div className="text-sm text-gray-600">Average Stories per Student</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {filteredStudents.filter(s => s.statistics.avgOverallScore >= 85).length}
                </div>
                <div className="text-sm text-gray-600">High Performers (85%+)</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {filteredStudents.filter(s => s.streak?.current >= 3).length}
                </div>
                <div className="text-sm text-gray-600">Students with 3+ Day Streaks</div>
              </div>
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}