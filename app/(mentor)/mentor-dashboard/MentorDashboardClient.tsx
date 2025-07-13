// app/(mentor)/mentor-dashboard/MentorDashboardClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Clock,
  Star,
  Award,
  Eye,
  Edit,
  Calendar,
  Target,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User,
  Activity,
  ChevronRight,
  Flag,
  Heart
} from 'lucide-react';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';

import { formatDate, formatNumber } from '@utils/formatters';
import { getGreeting } from '@utils/helpers';
import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';
import type { User as UserType } from '@/types/user';
import type { Story } from '@/types/story';
import type { Comment } from '@/types/comment';

interface MentorDashboardProps {
  mentor: UserType;
  students: UserType[];
  recentStories: Story[];
  pendingReviews: Story[];
  myComments: Comment[];
  statistics: {
    totalStudents: number;
    activeStudents: number;
    totalStories: number;
    storiesThisWeek: number;
    totalComments: number;
    pendingReviews: number;
  };
}

export default function MentorDashboardClient({
  mentor,
  students,
  recentStories,
  pendingReviews,
  myComments,
  statistics
}: MentorDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
      page: 'mentor-dashboard',
      mentorId: mentor._id,
      totalStudents: statistics.totalStudents,
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [mentor._id, statistics.totalStudents]);

  const greeting = getGreeting();

  const dashboardStats = [
    {
      label: 'Assigned Students',
      value: statistics.totalStudents,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: `${statistics.activeStudents} active`,
      href: '/student-progress',
    },
    {
      label: 'Stories to Review',
      value: statistics.pendingReviews,
      icon: Flag,
      color: 'from-orange-500 to-red-500',
      change: 'Need attention',
      href: '/student-stories?filter=pending',
    },
    {
      label: 'Comments Given',
      value: statistics.totalComments,
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
      change: 'All time',
      href: '/student-stories',
    },
    {
      label: 'Stories This Week',
      value: statistics.storiesThisWeek,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      change: 'New submissions',
      href: '/student-stories?filter=recent',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <FadeIn>
        <div className="bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 rounded-3xl p-8 text-white relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👨‍🏫</span>
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    {greeting}, {mentor.name}!
                  </h1>
                </div>
                
                <p className="text-xl text-blue-100">
                  Ready to inspire your students today?
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(currentTime, 'full')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Mentor since {formatDate(mentor.mentoringSince || mentor.createdAt, 'year')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/student-stories">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Review Stories
                  </Button>
                </Link>
                
                <Link href="/student-progress">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white/10"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    View Students
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <FadeIn key={stat.label} delay={0.1 * index}>
            <Link href={stat.href}>
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
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
            </Link>
          </FadeIn>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pending Reviews */}
          {pendingReviews.length > 0 && (
            <SlideIn direction="up" delay={0.2}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Flag className="w-6 h-6 text-orange-600" />
                    Stories Awaiting Review
                  </h2>
                  <Badge variant="warning" size="sm">
                    {pendingReviews.length} pending
                  </Badge>
                </div>

                <div className="space-y-4">
                  {pendingReviews.slice(0, 3).map((story) => (
                    <div key={story.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {story.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            by {story.authorId?.name}, age {story.authorId?.age}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Published {formatDate(story.updatedAt, 'relative')}</span>
                            <span>{story.wordCount} words</span>
                            {story.aiAssessment && (
                              <span>AI Score: {story.aiAssessment.overallScore}%</span>
                            )}
                          </div>
                        </div>
                        <Link href={`/student-stories/${story.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}

                  {pendingReviews.length > 3 && (
                    <div className="text-center pt-4">
                      <Link href="/student-stories?filter=pending">
                        <Button variant="outline">
                          View All {pendingReviews.length} Pending Reviews
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            </SlideIn>
          )}

          {/* Recent Stories */}
          <SlideIn direction="up" delay={0.3}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Recent Student Stories
                </h2>
                <Link href="/student-stories">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {recentStories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Student Stories Yet
                  </h3>
                  <p className="text-gray-600">
                    Your students haven't written any stories yet. Encourage them to start writing!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentStories.slice(0, 5).map((story) => (
                    <div key={story.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        story.status === 'published' ? 'bg-green-100 text-green-600' :
                        story.status === 'draft' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <BookOpen className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{story.title}</h3>
                            <p className="text-sm text-gray-600">
                              by {story.authorId?.name}, age {story.authorId?.age}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500">
                                {formatDate(story.updatedAt, 'relative')}
                              </span>
                              <Badge
                                variant={
                                  story.status === 'published' ? 'success' :
                                  story.status === 'draft' ? 'warning' : 'default'
                                }
                                size="sm"
                              >
                                {story.status}
                              </Badge>
                              {story.wordCount && (
                                <span className="text-xs text-gray-500">
                                  {formatNumber(story.wordCount)} words
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {story.aiAssessment && (
                              <div className="text-right mr-3">
                                <div className="text-sm font-bold text-green-600">
                                  {story.aiAssessment.overallScore}%
                                </div>
                                <div className="text-xs text-gray-500">AI Score</div>
                              </div>
                            )}
                            
                            <Link href={`/student-stories/${story.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </SlideIn>

          {/* My Recent Comments */}
          <SlideIn direction="up" delay={0.4}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                  My Recent Feedback
                </h2>
                <Badge variant="info" size="sm">
                  {statistics.totalComments} total comments
                </Badge>
              </div>

              {myComments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No comments yet. Start reviewing student stories!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myComments.map((comment) => (
                    <div key={comment.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              Comment on "{comment.storyId?.title}"
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt, 'relative')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {comment.content}
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" size="sm">
                              {comment.commentType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </SlideIn>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Students */}
          <FadeIn delay={0.5}>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                My Students ({statistics.totalStudents})
              </h3>

              {students.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    No students assigned yet. Contact your admin to get students assigned.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.slice(0, 5).map((student) => (
                    <Link key={student._id} href={`/student-progress/${student._id}`}>
                      <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>Age {student.age}</span>
                            <span>{student.storyCount || 0} stories</span>
                            <span>Level {student.level || 1}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {student.streak?.current > 0 && (
                            <div className="flex items-center gap-1 text-orange-500">
                              <Activity className="w-3 h-3" />
                              <span className="text-xs">{student.streak.current}</span>
                            </div>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))}

                  {students.length > 5 && (
                    <Link href="/student-progress">
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        View All {students.length} Students
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </Card>
          </FadeIn>

          {/* Quick Actions */}
          <SlideIn direction="right" delay={0.6}>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Quick Actions
              </h3>

              <div className="space-y-3">
                <Link href="/student-stories?filter=pending">
                  <div className="p-3 border border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center">
                        <Flag className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Review Pending</div>
                        <div className="text-xs text-gray-600">{statistics.pendingReviews} stories waiting</div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/student-stories?filter=recent">
                  <div className="p-3 border border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Recent Stories</div>
                        <div className="text-xs text-gray-600">See latest submissions</div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/student-progress">
                  <div className="p-3 border border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Student Progress</div>
                        <div className="text-xs text-gray-600">Track improvements</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </Card>
          </SlideIn>

          {/* Mentoring Tips */}
          <SlideIn direction="right" delay={0.7}>
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Mentoring Tip
              </h3>

              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  💡 <strong>Today's Tip:</strong> When providing feedback, always start with 
                  something positive about the student's story before suggesting improvements.
                </p>

                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Example:</p>
                  <p className="text-sm italic text-gray-700">
                    "I love how creative your character is! Try adding more details about 
                    what they see and feel to make your story even more exciting."
                  </p>
                </div>
              </div>
            </Card>
          </SlideIn>
        </div>
      </div>
    </div>
  );
}