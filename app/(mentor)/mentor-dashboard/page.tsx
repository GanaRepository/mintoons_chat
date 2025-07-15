// app/(mentor)/mentor-dashboard/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth/config';
import { redirect } from 'next/navigation';
import MentorDashboardClient from './MentorDashboardClient';
import { LoadingAnimation } from '@components/animations/LoadingAnimation';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import Comment from '@models/Comment';

export const metadata: Metadata = {
  title: 'Mentor Dashboard',
  description: 'Overview of your assigned students, recent stories, and mentoring activities.',
};

async function getMentorDashboardData(mentorId: string) {
  await connectDB();

  const mentorRaw = await User.findById(mentorId)
    .select('-password')
    .populate('assignedStudents', 'firstName lastName name email age storyCount level streak')
    .lean();

  // Defensive cast for mentor and students
  const mentor = mentorRaw as unknown as import('@/types/user').User & { assignedStudents?: any[] };
  // Filter out string ids from assignedStudents and cast to UserType
  const students = Array.isArray(mentor.assignedStudents)
    ? mentor.assignedStudents.filter(s => typeof s === 'object' && s !== null) as import('@/types/user').User[]
    : [];

  if (!mentor || mentor.role !== 'mentor') {
    return null;
  }

  const studentIds = students.map(s => (s as import('@/types/user').User)._id) || [];

  const [recentStoriesRaw, pendingReviewsRaw, myCommentsRaw, totalComments] = await Promise.all([
    Story.find({ authorId: { $in: studentIds } })
      .populate('authorId', 'firstName lastName name age')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean(),
    
    Story.find({ 
      authorId: { $in: studentIds },
      status: 'published',
      needsMentorReview: true
    })
      .populate('authorId', 'firstName lastName name age')
      .sort({ updatedAt: -1 })
      .lean(),
    
    Comment.find({ commenterId: mentorId })
      .populate('storyId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    
    Comment.countDocuments({ commenterId: mentorId })
  ]);

  // Defensive cast for stories/comments
  const recentStories = recentStoriesRaw as any[];
  const pendingReviews = pendingReviewsRaw as any[];
  const myComments = myCommentsRaw as any[];

  // Calculate statistics
  const totalStudents = studentIds.length;
  const activeStudents = students.filter(s =>
    typeof s !== 'string' &&
    ((s.streak && typeof s.streak === 'object' && 'current' in s.streak && (s.streak as any).current > 0) ||
      new Date((s as any).lastActiveAt || 0) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  ).length || 0;

  const totalStories = recentStories.length;
  const storiesThisWeek = recentStories.filter(s => 
    new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return {
    mentor,
    students,
    recentStories,
    pendingReviews,
    myComments,
    statistics: {
      totalStudents,
      activeStudents,
      totalStories,
      storiesThisWeek,
      totalComments,
      pendingReviews: pendingReviews.length,
    },
  };
}

export default async function MentorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/mentor-dashboard');
  }

  const dashboardData = await getMentorDashboardData(session.user._id);

  if (!dashboardData) {
    redirect('/unauthorized?role=mentor');
  }

  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingAnimation size="lg" />
        </div>
      }
    >
      <MentorDashboardClient 
        mentor={dashboardData.mentor}
        students={dashboardData.students}
        recentStories={dashboardData.recentStories}
        pendingReviews={dashboardData.pendingReviews}
        myComments={dashboardData.myComments}
        statistics={dashboardData.statistics}
      />
    </Suspense>
  );
}