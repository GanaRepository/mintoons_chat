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

  const mentor = await User.findById(mentorId)
    .select('-password')
    .populate('assignedStudents', 'name email age storyCount level streak')
    .lean();

  if (!mentor || mentor.role !== 'mentor') {
    return null;
  }

  const studentIds = mentor.assignedStudents?.map(s => s._id) || [];

  const [recentStories, pendingReviews, myComments, totalComments] = await Promise.all([
    Story.find({ authorId: { $in: studentIds } })
      .populate('authorId', 'name age')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean(),
    
    Story.find({ 
      authorId: { $in: studentIds },
      status: 'published',
      needsMentorReview: true
    })
      .populate('authorId', 'name age')
      .sort({ updatedAt: -1 })
      .lean(),
    
    Comment.find({ commenterId: mentorId })
      .populate('storyId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    
    Comment.countDocuments({ commenterId: mentorId })
  ]);

  // Calculate statistics
  const totalStudents = studentIds.length;
  const activeStudents = mentor.assignedStudents?.filter(s => 
    s.streak?.current > 0 || new Date(s.lastActiveAt || 0) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length || 0;

  const totalStories = recentStories.length;
  const storiesThisWeek = recentStories.filter(s => 
    new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return {
    mentor,
    students: mentor.assignedStudents || [],
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

  const dashboardData = await getMentorDashboardData(session.user.id);

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